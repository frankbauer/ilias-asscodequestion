import Vue from 'vue'

//function runJavaScriptWorker( code, log_callback, max_ms, questionID){
function runJavaScriptWorker (questionID, code, callingCodeBlocks, max_ms, log_callback, info_callback, err_callback, compileFailedCallback,  finishedExecutionCB){
    
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
    ,   "console.log = function(s){"                    // only allow .log , .warn
    ,   "   postMessage(['log',''+s]);"
    ,   "};"
    ,   "console.error = function(s){"                    // only allow .error
    ,   "   postMessage(['err',''+s]);"
    ,   "};"
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
        finishedExecutionCB(false); 
        if(msg) err_callback( msg + "\n");
    }

    var start = Date.now();
    var testTimeout = function(){    
        var time = Date.now()-start;
        worker.end("TimeoutError:  Execution took too long (>"+time+"ms) and was terminated. There might be an endless loop in your code.");        
    };

    var testTimeoutIntern = function(){    
        var time = Date.now()-start;
        if(time > max_ms){
            testTimeout
        }
    };
        
    worker.onmessage = function(e){
        if(executionFinished) return;
        //only accept messages, when worker not terminated (workers do not immetiately terminate)

        testTimeoutIntern();
        if( e.data[0] == 'finished' ){
            finishedExecutionCB();            
            info_callback("Info: Execution finished in " + (Date.now() - start) + " ms\n");
            worker.end();
        }else if(e.data[0]=='log'){
            log_callback(e.data[1] + "\n");
        }else if(e.data[0]=='err'){
            err_callback(e.data[1] + "\n");
        }else{
            worker.end("HackerError: Great! You invaded our System. Sadly this will lead you nowhere. Please focus on the Test.");
        }
    }
    worker.onerror   = function(e){          
        if(e.lineno == 1) { 
            compileFailedCallback({
                start : { line: -1, column:-1},
                end : { line: -1, column:-1},
                message: e.message,
                severity: Vue.$SEVERITY_ERROR
            });
            worker.end("Error: "+e.message);
        } else if(e.lineno >= lines+2)  {
            compileFailedCallback({
                start : { line: lines+2, column:0},
                end : { line: lines+2, column:0},
                message: e.message,
                severity: Vue.$SEVERITY_ERROR
            });
            worker.end("EndOfFile: "+ e.message );
        } else {
            compileFailedCallback({
                start : { line: (e.lineno-2), column:e.colno-1},
                end : { line: (e.lineno-2), column:e.colno},
                message: e.message,
                severity: Vue.$SEVERITY_ERROR
            });
            worker.end('Line '+(e.lineno-2)+": "+e.message);
        }        
    }
    worker.postMessage(['start',[10,200]]);                                //start worker execution

    setTimeout( testTimeout, max_ms );
}


const singleton = new Vue({
    data: function () {
        return {
            version: "100",
            language: "javascript",    
            canRun: true,
            isReady: true,
            isRunning: false,
            libraries: [
                {
                    key: 'd3-5-14-3',
                    name: 'd3',
                    version: '5.14.3',
                    displayName: 'D3 - Data-Driven Documents',
                }
            ]
        }
    },
    methods: {
        preload() {
            
        },
        compileAndRun(questionID, code, callingCodeBlocks, max_ms, log_callback, info_callback, err_callback, compileFailedCallback, finishedExecutionCB, runCreate = true){
            return runJavaScriptWorker(questionID, code, callingCodeBlocks, max_ms, log_callback, info_callback, err_callback, compileFailedCallback, finishedExecutionCB, runCreate);
        }
    }
})
export default singleton;