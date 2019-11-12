import Vue from 'vue'
let SEVERITY_ERROR;
/**
 * The function pass the Python program to a worker. The worker runs the program
 * and return the standard output to the main thread.
 * @param {string} prog The Python program
 * @param {string} questionID The id of the question to read the Python program from html page
 * @param {HTML-element} mypre The HTML-element to write the output of the Python program.
 */
function runPythonWorker(questionID, prog, mypre, maxRuntime, logCallback, infoCallback, errCallback, compileFailedCallback, finishCallback) { 
    // the Python program
    prog = prog.replaceAll("\t", "    ");    
    
    if(!window.Worker){
        errCallback("CRITICAL-ERROR: your browser does not support WebWorkers!! (please consult a Tutor).");
        return;
    }

    var worker = new Worker('js/python/v100/pyWorker.js');
    
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
            console.error(err, err.args.v.length);
            if (err && err.args && err.args.v && err.args.v.length>=4){
                console.log("what")
                compileFailedCallback({
                    start : { line: err.args.v[3][0][0]-1, column:err.args.v[3][0][0]-1-1},
                    end : { line: err.args.v[3][1][0]-1-1, column:err.args.v[3][1][0]-1-1},
                    message: err.args.v[0].v + ": " + err.args.v[3][2],
                    severity: SEVERITY_ERROR
                });
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
        compileAndRun(questionID, code, mypre, max_ms, log_callback, info_callback, err_callback, compileFailedCallback, finishedExecutionCB, runCreate = true){
            return runPythonWorker(questionID, code, mypre, max_ms, log_callback, info_callback, err_callback, compileFailedCallback, finishedExecutionCB, runCreate);
        }
    },
    created(){
        SEVERITY_ERROR = this.SEVERITY_ERROR;
    }
})
export default singleton;