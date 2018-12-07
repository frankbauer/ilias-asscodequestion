//function runDummy(questionID, prog, mypre, maxRuntime, logCallback, infoCallback, errCallback, compileFailedCallback, finishCallback)

function runPythonWorker(questionID, prog, mypre, maxRuntime, logCallback, infoCallback, errCallback, compileFailedCallback, finishCallback) { 
    // the Python program
    prog = prog.replaceAll("\t", "    ");    
    
    
    
    if(!window.Worker){
        errCallback("CRITICAL-ERROR: your browser does not support WebWorkers!! (please consult a Tutor).");
        return;
    }

    //var urlLoc = {url: document.location.href.substring(0, document.location.href.lastIndexOf("/"))};
    //var path = urlLoc.url+'/data/assCodeQuestion';
    //var path  = './Customizing/global/plugins/Modules/TestQuestionPool/Questions/assCodeQuestion';
    var worker = new Worker('./Customizing/global/plugins/Modules/TestQuestionPool/Questions/assCodeQuestion/js/pyWorker.js');
    //var urlLoc = {url: document.location.href.substring(0, document.location.href.lastIndexOf("/")) + '/'};
    
    // construct message for worker
    var pyInp = []; // not used jet
    
    var messageData = {pyProg: prog, pyInp: pyInp, maxMS: maxRuntime};
    worker.postMessage(['b8e493ca02970aeb0ef734555526bf9b',messageData]);
    var start = Date.now();
    
    var testTimeout = function(){    
        var time = Date.now()-start;
        if(time > maxRuntime){
            worker.end("TimeoutError:  Execution took too long (> "+time+" ms) and was terminated. There might be an endless loop in your code.");
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
        }
    worker.onmessage = function(e){
        if(executionFinished) return;
        //only accept messages, when worker not terminated (workers do not immetiately terminate)
        if (testTimeout() === true) { return; }
        if( e.data[0] == 'finished' ){
            finishCallback();            
            infoCallback("Info: Execution finished in : " + (Date.now() - start) + " ms");
            worker.end();
        }else if (e.data[0] ==='err'){                          
            worker.end("ERROR: " + e.data[1]);
        } else {       
            worker.end("Unknown error: " + e.data[1]);
        }
    }
    // in any case use the window timeout to terminate the worker
    setTimeout(testTimeout, maxRuntime);
    
}

(function () {
    registerLanguage('python', runPythonWorker);
  })();