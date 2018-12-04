var teaworker;
var isReady = false;


function createTeaWorker(questionID, whenReady){
    if (teaworker === undefined) {
        setAllRunButtons(false);
        displayGlobalState("Initializing Runtime");
        teaworker = new Worker('./Customizing/global/plugins/Modules/TestQuestionPool/Questions/assCodeQuestion/js/teavm/worker.js');

        teaworker.addEventListener('message', function(e) {
            console.log(e.data);
            if (e.data.command == 'ok' && e.data.id == 'didload-classlib') {
                
                isReady = true;
                if (whenReady) {
                    console.log("loopback to initial caller");
                    whenReady();
                } else {
                    setAllRunButtons(true);
                    hideGlobalState();
                }
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
    if (runCreate){
        if (createTeaWorker(questionID, function(){
            runTeaVMWorker(questionID, code, mypre, max_ms, log_callback, info_callback, err_callback, compileFailedCallback, finishedExecutionCB, false);
        })){
            finishedExecutionCB();
            return;
        } 
    }

    if (!isReady) {
        err_callback("System is not yet ready. Please wait until Initialization finishes or call a tutor.");
        return;
    }  

    var mainClass = 'Unknown';
    let regexpMainClass = /(['"])(?:[^"'\\]+|(?!\1)["']|\\{2}|\\[\s\S])*\1|public\s*?class\s*?([a-zA-Z_$0-9]*?)\s*?(\{|implements|extends)/gm
    while (match = regexpMainClass.exec(code)) {
        if (match[2]) {
            mainClass = match[2];
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
                    compileFailedCallback();
                } else {
                    msg = e.data.message.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
                        return '&#'+i.charCodeAt(0)+';';
                     }) + " (in " + e.data.object.name + " " + e.data.lineNumber + ":" + e.data.columnNumber + ")\n";
                    if (e.data.kind == 'ERROR') {
                        err_callback(msg);
                    } else {
                        info_callback(msg);
                    }
                }
            } else if (e.data.command == 'compilation-complete') {            
                teaworker.removeEventListener('message', myListener);

                if (e.data.status == 'errors') {
                    hideGlobalState();  
                    finishedExecutionCB(); 
                    setAllRunButtons(true);
                } else {
                    displayGlobalState("Executing <b>"+mainClass+"</b>");
                    var workerrun = new Worker('./Customizing/global/plugins/Modules/TestQuestionPool/Questions/assCodeQuestion/js/teavm/workerrun.js');
                    workerrun.addEventListener('message', function(ee) {
                        if (ee.data.command == 'run-finished-setup') {

                        } else if (ee.data.command == 'run-completed'){
                            hideGlobalState();  
                            finishedExecutionCB(); 
                            setAllRunButtons(true);
                        } else if (ee.data.command == 'stdout') {
                            log_callback(ee.data.line);
                        } else if (ee.data.command == 'stderr') {
                            err_callback(ee.data.line);
                        }
                    });
        
                    workerrun.postMessage({
                      command:'run',
                      id:''+questionID,
                      code: e.data.script
                    });  
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
}


(function () {    
    registerLanguage('java2', runTeaVMWorker, 'java');
  })();