import Vue from 'vue'


function runPythonWorker(questionID, prog, callingCodeBlocks, maxRuntime, logCallback, infoCallback, errCallback, compileFailedCallback, finishCallback) { 
    // the Python program
    prog = prog.replaceAll("\t", "    ");    
    
    if(!window.Worker){
        errCallback("CRITICAL-ERROR: your browser does not support WebWorkers!! (please consult a Tutor).");
        return;
    }

    var worker = new Worker(Vue.$CodeBlock.baseurl+'js/python/v100/pyWorker.js');
    
    // construct message for worker
    var pyInp = []; // not used jet
    
    var messageData = {pyProg: prog, pyInp: pyInp, maxMS: maxRuntime};
    worker.postMessage(['b8e493ca02970aeb0ef734555526bf9b',messageData]);
    var start = Date.now();
    
    var testTimeout = function(){         
        var time = Date.now()-start;
        worker.end("TimeoutError:  Execution took too long (> "+time+" ms) and was terminated. There might be an endless loop in your code.");        
    };

    var testTimeoutIntern = function(){
        var time = Date.now()-start;
        if(time > maxRuntime){
            testTimeout();
            return true;
        }
        return false;
    }
    var executionFinished = false;
    worker.end = function(msg){
        if(executionFinished) return;
        worker.terminate(); 
        executionFinished = true;
        finishCallback(false);
        if(msg) errCallback( msg );
    };

    worker.onmessage = function(e){
        if(executionFinished) return;
        //only accept messages, when worker not terminated (workers do not immetiately terminate)
        if (testTimeoutIntern() === true) { return; }
        if( e.data[0] == 'finished' ){
            logCallback(e.data[1].stdOut);
            finishCallback();            
            infoCallback("Info: Execution finished in : " + (Date.now() - start) + " ms");
            worker.end();
        }else if (e.data[0] ==='err'){  
            const err = JSON.parse(e.data[2]);              
            if (err && err.lineno!==undefined && err.colno!==undefined){                
                compileFailedCallback({
                    start : { line: err.lineno-1, column:err.colno},
                    end : { line: err.lineno-1, column:err.colno+1},
                    message: err.message,
                    severity: Vue.$SEVERITY_ERROR
                });
            } else {
                if (err && err.lineno!==undefined){
                    compileFailedCallback({
                        start : { line: err.lineno-1, column:0},
                        end : { line: err.lineno-1, column:0},
                        message: err.message,
                        severity: Vue.$SEVERITY_ERROR
                    });
                }
            }
            worker.end("ERROR: " + e.data[1]);
        } else {       
            worker.end("Unknown error: " + e.data[1]);
        }
    }
    // in any case use the window timeout to terminate the worker
    setTimeout(testTimeout, maxRuntime);
    
}

const singleton = new Vue({
    data: function () {
        return {
            version: "100",
            language: "python",    
            canRun: true,
            isReady: true,
            isRunning: false
        }
    },
    methods: {
        preload() {
            
        },
        compileAndRun(questionID, code, callingCodeBlocks, max_ms, log_callback, info_callback, err_callback, compileFailedCallback, finishedExecutionCB, runCreate = true){
            return runPythonWorker(questionID, code, callingCodeBlocks, max_ms, log_callback, info_callback, err_callback, compileFailedCallback, finishedExecutionCB, runCreate);
        }
    }
})
export default singleton;