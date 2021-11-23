self.importScripts('worker/runtime.js')

function listener(event) {
    let request = event.data
    //console.log('JAVA-WORKE-RUN-MSG', request)
    if (request.command == 'run') {
        var $stderrBuffer = ''
        var $stdoutBuffer = ''

        $rt_putStdoutCustom = function(ch) {
            if (ch === 0xa) {
                self.postMessage({ command: 'stdout', line: $stdoutBuffer, id: request.id })
                $stdoutBuffer = ''
            } else {
                $stdoutBuffer += String.fromCharCode(ch)
            }
        }

        $rt_putStderrCustom = function(ch) {
            if (ch === 0xa) {
                self.postMessage({ command: 'stderr', line: $stderrBuffer, id: request.id })
                $stderrBuffer = ''
            } else {
                $stderrBuffer += String.fromCharCode(ch)
            }
        }

        let blob = new Blob([request.code], { type: 'application/javascript' })
        let URLObject = URL.createObjectURL(blob)
        self.importScripts(URLObject)
        self.postMessage({ command: 'run-finished-setup', id: request.id })

        try {
            console.log('Starting')
            main(request.args)
        } catch (EE) {
            if (EE instanceof Error){
                console.log('APPLICATION ERROR', EE)
                $stderrBuffer += 'Application Terminated (' + EE.name + '): ' + EE.message
            } else {
                console.log('APPLICATION ERROR', EE)
                $stderrBuffer += 'Application Terminated due to an internal Error.'
            }
        }

        if ($stderrBuffer != '') {
            self.postMessage({ command: 'stderr', line: $stderrBuffer, id: request.id })
        }
        if ($stdoutBuffer != '') {
            self.postMessage({ command: 'stdout', line: $stdoutBuffer, id: request.id })
        }

        self.postMessage({ command: 'run-completed', id: request.id })

        URLObject = undefined
        blob = undefined
        $stderrBuffer = undefined
        $stdoutBuffer = undefined
        self.removeEventListener('message', listener)
    }
    request = undefined
}

self.addEventListener('message', listener)
