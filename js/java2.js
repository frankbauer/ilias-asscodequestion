var teaworker;
var isReady = false;
var isRunning = false;
var teaVMRunOverhead = 30000;
function createTeaWorker(whenReady){
    if (teaworker === undefined) {
        setAllRunButtons(false);
        displayGlobalState("Initializing Runtime");
        teaworker = new Worker('./Customizing/global/plugins/Modules/TestQuestionPool/Questions/assCodeQuestion/js/teavm/worker.js');

        teaworker.addEventListener('message', function(e) {
            console.log(e.data);
            if (e.data.command == 'ok' && e.data.id == 'didload-classlib') {
                teaworker.postMessage({
                    command:"compile",
                    id:'prep',
                    text:'public class Bootstrap { public static void main(String[] args){}}',
                    mainClass:'Bootstrap'
                });
                isReady = true;
                if (whenReady) {
                    console.log("loopback to initial caller");
                    whenReady();
                } else {
                    setAllRunButtons(true);
                    hideGlobalState();
                }
            } else if (e.data.id == 'prep' && e.data.command=='compilation-complete'){
                /* We could finish initialization here if there appear to be races when compiling multiple sources at once */
            }
        });

        //bootstrap environment
        teaworker.postMessage({
            command:'load-classlib',
            id:'didload-classlib',
            url:'classlib.txt'
        });

        return true;
    }

    return false;
}

function runTeaVMWorker(questionID, code, mypre, max_ms, log_callback, info_callback, err_callback, compileFailedCallback, finishedExecutionCB, runCreate=true) {
    var start = Date.now();
    var executionFinished = false; 
    var booted = false;   

    if (isRunning) {
        err_callback("System is busy. Please wait until compilation finishes or call a tutor.");
        return;
    } 
    isRunning = true;
    if (runCreate){
        if (createTeaWorker(function(){
            isRunning = false;
            runTeaVMWorker(questionID, code, mypre, max_ms, log_callback, info_callback, err_callback, compileFailedCallback, finishedExecutionCB, false);
        })){
            return;
        } 
    }

    if (!isReady) {
        err_callback("System is not yet ready. Please wait until Initialization finishes or call a tutor.");
        return;
    }  

    
    var mainClass = 'Unknown';
    let text = code.replace(/"(?:[^"\\]+?|(?!")"|\\{2}|\\[\s\S])*?"|^.*(\/\/.*$)|\/\*[\s\S]*?\*\//gm, ''); //replace strings and comments    
    
    text = text.replaceRec(/(\{[^{}]*\})/gm, '[]'); //replace parentheses    

    //above replaces all {} with [], so look for public class <name> []
    let regexpMainClass = /public\s+?class\s+?([a-zA-Z_$0-9]+?)\s*?(\[|\simplements|\sextends)/gm;
    while (match = regexpMainClass.exec(text)) {
        if (match[1]) {
            mainClass = match[1];
            break;
        }
    }

    console.log(mainClass, code);
    var myListener = function(e) {        
        console.log(questionID, e.data);
        if (e.data.id == ''+questionID){
            if (e.data.command == 'phase') {
                if (e.data.phase == 'DEPENDENCY_ANALYSIS') {
                    displayGlobalState("Compiling & Analyzing <b>"+mainClass+".java</b>");
                } else if (e.data.phase == 'LINKING') {
                    displayGlobalState("Linking <b>"+mainClass+".java</b>");
                } else if (e.data.phase == 'OPTIMIZATION') {
                    displayGlobalState("Optimizing <b>"+mainClass+".java</b>");
                }
            } else if (e.data.command == 'compiler-diagnostic') {
                if (compileFailedCallback){
                    compileFailedCallback({
                        message:e.data.message,
                        start:{line:e.data.startLineNumber, column:e.data.startColumn},
                        end:{line:e.data.endLineNumber, column:e.data.endColumn},
                        severity:e.data.kind=='ERROR' ? SEVERITY_ERROR : SEVERITY_WARNING
                    });
                } 

                msg = e.data.humanReadable + "\n";
                if (e.data.kind == 'ERROR') {
                    err_callback(msg+"\n");
                } else {
                    info_callback(msg+"\n");
                }                
            } else if (e.data.command == 'compilation-complete') {  
                booted = true;          
                teaworker.removeEventListener('message', myListener);

                if (e.data.status == 'errors') {                    
                    finishedExecutionCB(false); 
                    isRunning = false;                    
                } else {
                    displayGlobalState("Executing <b>"+mainClass+"</b>");
                    var workerrun = new Worker('./Customizing/global/plugins/Modules/TestQuestionPool/Questions/assCodeQuestion/js/teavm/workerrun.js');
                    workerrun.addEventListener('message', function(ee) {
                        if (ee.data.command == 'run-finished-setup') {

                        } else if (ee.data.command == 'run-completed'){
                            finishedExecutionCB(); 
                            info_callback("Info: Execution finished in " + (Date.now() - start) + " ms\n");
                            executionFinished = true;
                            isRunning = false;
                            workerrun.end();
                        } else if (ee.data.command == 'stdout') {
                            log_callback(ee.data.line+"\n");
                        } else if (ee.data.command == 'stderr') {
                            err_callback(ee.data.line+"\n");
                        }
                    });
        
                    workerrun.postMessage({
                      command:'run',
                      id:''+questionID,
                      code: e.data.script
                    }); 
                    
                    workerrun.end = function(msg){
                        if(executionFinished) return;
                        workerrun.terminate();
                        executionFinished = true;
                        finishedExecutionCB(false); 
                        isRunning = false;
                        if(msg) err_callback( msg + "\n");
                    };

                    var runStart = Date.now();
                    var testTimeout = function(){    
                        var time = Date.now()-runStart;
                        workerrun.end("TimeoutError:  Execution took too long (>"+time+"ms) and was terminated. There might be an endless loop in your code.");                                                    
                    };

                    setTimeout( testTimeout, max_ms );
                }
            }
        }
    };
    
    teaworker.addEventListener('message', myListener);
    console.log(code);
    setAllRunButtons(false);    
    displayGlobalState("Starting Compiler for <b>" + mainClass + ".java</b>");

    teaworker.postMessage({
        command:"compile",
        id:''+questionID,
        text:code,
        mainClass:mainClass
    });

    teaworker.end = function(msg){
        if(booted) return;
        teaworker.terminate();
        finishedExecutionCB(false); 
        isRunning = false;
        isReady = false;
        if(msg) err_callback( msg + "\n");
    };

    setTimeout( function(){
        if(!booted){
            var time = Date.now()-start;
            teaworker.end("TimeoutError:  Compilation took too long (>"+time+"ms) and was terminated. Trying to reset the System. Please re-run your code and call a Tutor if this Problem persists.");            
            teaworker = undefined;
        }
    }, teaVMRunOverhead );
}


(function () {
    $( document ).ready(function() {
        var preloadElement = $('input[data-preload-runtime=java2]');
        if (preloadElement && preloadElement.length>0){
            console.log("[Preloading TeaVM for Java]");
            isRunning = true;
            createTeaWorker(function(){
                isRunning = false;
                hideGlobalState();  
                setAllRunButtons(true);
            });
        } 
    });
    
    
    registerLanguage('java2', runTeaVMWorker, 'java');
  })();