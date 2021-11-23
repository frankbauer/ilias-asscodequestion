const CodeBlocks = {
    worker: undefined,
    postResult: function (obj) {
        const msg = {
            value: obj,
            command: `f-FINAL`,
            id: -1,
        }
        this.worker.postMessage(msg)
    },
    postMessage: function (cmd, id, data) {
        const msg = {
            ...data,
            command: `w-${cmd}`,
            id: id,
        }
        this.worker.postMessage(msg)
    },
    listener: undefined,
    startReceivingEvents: function (handler) {
        if (this.listener != null) {
            this.stopReceivingEvents()
        }
        this.listener = (request) => {
            let cmd = request.command
            if (cmd.startsWith('d-')) {
                cmd = cmd.substring(2)
                request.command = cmd
                handler(request)
            }
        }
    },
    stopReceivingEvents: function () {
        if (this.listener != null) {
            this.listener = null
        }
    },
    _forward: function (event) {
        if (this.listener) {
            this.listener(event)
        }
    },
}

const process = {
    exit: function (code) {
        CodeBlocks.postMessage('exit-keepalive', -1, { value: code })
    },
}
