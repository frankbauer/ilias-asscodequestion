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

JavaExec.setRunButton = function (enabled) {
    self.postMessage({ event: 'setRunButton', enabled:enabled })
}

self.addEventListener('message', function (e) {
    const data = e.data;
    switch (data.cmd) {
        case 'run':
            JavaExec.initialize(function () {
                console.log("Initializing Filesystem", JavaExec.persistentFs);
                JavaExec.initFileSystems('../', function () {
                    JavaExec.reroutStdStreams();
                    JavaExec.ready = true;
                    JavaExec.compileAndRun(data.code, data.className, data.max_ms, function (stdout, stderr) {
                        self.postMessage({ event: 'finished', stderr: stderr, stdout: stdout })
                    }, function () {
                        self.postMessage({ event: 'startTimer' })
                    })
                })
            })

            break
        case 'kill':
            if (JavaExec.terminate()) {
                JavaExec.terminate()
                self.postMessage({ event: 'finished', stderr: "Terminated Execution after timeout", stdout: JavaExec.combinedStream })
            }
            break
    }
})