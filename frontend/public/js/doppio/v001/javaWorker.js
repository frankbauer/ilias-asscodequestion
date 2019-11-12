if ('function' === typeof importScripts) {
    importScripts('./browserfs/browserfs.min.js');
    importScripts('./doppio/doppio.js');
    importScripts('./JavaExec.js');
} else {
    console.error("Could not load JVM Environment")
}

JavaExec.showMessage = function (msg) {
    self.postMessage({ event: 'showMessage', msg:msg })
}

JavaExec.setRunButton = function (enabled, info=undefined) {    
    self.postMessage({ event: 'setRunButton', enabled:enabled, info:info })
}

JavaExec.log = function (msg) {
    self.postMessage({ event: 'output', msg:msg, type:'log' })
}

JavaExec.logError = function (msg) {    
    self.postMessage({ event: 'output', msg:msg, type:'err' })
}

JavaExec.logInfo = function (msg) {    
    self.postMessage({ event: 'output', msg:msg, type:'nfo' })
}

self.addEventListener('message', function (e) {
    const data = e.data;
    switch (data.cmd) {
        case 'run':
            JavaExec.initialize(function () {
                console.log("Initializing Filesystem");
                JavaExec.initFileSystems('./', data.forceReload, function () {
                    JavaExec.reroutStdStreams();
                    JavaExec.ready = true;
                    JavaExec.compileAndRun(data.code, data.className, data.max_ms, function (stdout, stderr) {
                        self.postMessage({ event: 'finished', stderr: stderr, stdout: stdout })
                    }, function () {
                        self.postMessage({ event: 'startTimer' })
                    }, function (err){                        
                        self.postMessage({event:'cleanCache'})                                                
                    })
                })
            })

            break
        case 'kill':
            console.log("Received kill command", JavaExec.terminate)                
            if (JavaExec.terminate) {
                JavaExec.terminate()
                self.postMessage({ event: 'finished', stderr: "Terminated Execution after timeout", stdout: JavaExec.combinedStream })
            }
            break
    }
})