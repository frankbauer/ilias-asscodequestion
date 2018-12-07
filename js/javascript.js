//function runJavaScriptWorker( code, log_callback, max_ms, questionID){
function runJavaScriptWorker (questionID, code, mypre, max_ms, log_callback, info_callback, err_callback, compileFailedCallback,  finishedExecutionCB){
    
    //console.log("submit");
    // TODO:: IE.11  does not support default arguments
    //    if(max_ms==undefined) max_ms=50;
    //    if(max_loglength==undefined) max_loglength=2000;
        
    var output = function(l){       // wrap the log
        //alert(l);
        if(!log_callback) console.log(l);
        else{                        
            log_callback( l + "\n");
        }
    }
    log_callback('');

    if(!window.Worker){
        err_callback("CRITICAL-ERROR: your browser does not support WebWorkers!! (please consult a Tutor).");
        return;
    }

    var not_allowed_keywords =['postMessage','close','onmessage','debugger'];      // blacklist (can be evaded, ... see below)
    for(var key in not_allowed_keywords){
        if(code.indexOf(not_allowed_keywords[key]) != -1){        // the user is not allowed to use the functionallity of the WebWorker
            err_callback("PermissionError: The usage of '"+not_allowed_keywords[key]+"' is not allowed (reserved keyword)!");
            return;
        }
    }
    var lines = code.split('\n').length;

    // The user-code is sourrounded by webworker start and finish code (one line each)
    // additionally, the console.log fnc is replaced, because the original log fnc is consuming much cpu ressources,
    //      and continues logging, even after the worker was terminated.

    var prefixCode =[
        "for(var c in console) console[c]=null;"   //delete all console functionality
    ,   "for(var t in this) if(t!='close' && t!='postMessage' && t!='console') this[t]=null;"   //delete all worker functionality
    ,   "this.console = {};"
    ,   "console.log = function(s){"                    // only allow .log , .warn and .error
    ,   "   postMessage(['log',''+s]);"
    ,   "};"
    ,   "console.error = console.log;"
    ,   "console.warn = console.log;"
    ,   "onmessage = function(input){"
    ,   "   postMessage(['finished',"
    ,   "   ''+(function(input){"
    ,   "           'use strict';"
    ,   "\n"
    ];
    var postfixCode=[
        "\n"
    ,   "})(input.data[1])]);"
    ,   "   close();"
    ,   "};"
    ];
    code = prefixCode.join('') + code + postfixCode.join('');


    //TODO:: creating a WebWorker from an URL is throwing a SecurityError in  IE 11  ...
    //          is there any workaround?
    var worker = new Worker(URL.createObjectURL(new Blob([code], {type: 'text/javascript'})));
    var executionFinished = false;
    worker.end = function(msg){
        if(executionFinished) return;
        worker.terminate();
        executionFinished = true;
        finishCallback(false); 
        if(msg) err_callback( msg + "\n");
    }

    var start = Date.now();
    var testTimeout = function(){    
        var time = Date.now()-start;
        if(time > max_ms){
            worker.end("TimeoutError:  Execution took too long (>"+time+"ms) and was terminated. There might be an endless loop in your code.");
        }
    }
        
    worker.onmessage = function(e){
        if(executionFinished) return;
        //only accept messages, when worker not terminated (workers do not immetiately terminate)

        testTimeout();
        if( e.data[0] == 'finished' ){
            finishedExecutionCB();            
            info_callback("Info: Execution finished in " + (Date.now() - start) + " ms\n");
            worker.end();
        }else if(e.data[0]=='log'){
            log_callback(e.data[1] + "\n");
        }else{
            worker.end("HackerError: Great! You invaded our System. Sadly this will lead you nowhere. Please focus on the Test.");
        }
    }
    worker.onerror   = function(e){         
        //errors before and after the user code are handled specially (to not confuse the user).
        if(e.lineno == 1)             worker.end("Error: "+e.message);
        else if(e.lineno >= lines+1)  worker.end("EndOfFile: "+ e.message );
        else                          worker.end('Line '+(e.lineno-1)+": "+e.message);
    }
    worker.postMessage(['start',[10,200]]);                                //start worker execution

    setTimeout( testTimeout, max_ms );
}

(function () {
    registerLanguage('javascript', runJavaScriptWorker);
  })();