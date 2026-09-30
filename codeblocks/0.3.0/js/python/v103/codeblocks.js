const CodeBlocks = {
    worker: undefined,
    postMessageRAW: function (cmd, id, data) {
        const msg = {
            ...data,
            command: cmd,
            id: id,
        }
        this.worker.postMessage(msg)
    },
    postMessage: function (cmd, id, data) {
        this.postMessageRAW(`w-${cmd}`, id, data)
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

const CodeBlocksClient = {
    test: function () {
        console.log('TEST TEST TEST')
    },
    postMessage: function (cmd, id, data) {
        CodeBlocks.postMessage(cmd, 0, data)
    },
    startReceivingEvents: function (handler) {
        CodeBlocks.startReceivingEvents(handler)
    },
    stopReceivingEvents: function () {
        CodeBlocks.stopReceivingEvents()
    },
    postResult: function (jsonObject) {
        CodeBlocks.postMessageRAW('f-FINAL', -1, { value: jsonObject })
    },
    exit: function (code) {
        CodeBlocks.postMessage('exit-keepalive', -1, { value: code })
    },
}

const process = {
    exit: function (code) {
        CodeBlocksClient.exit(code)
    },
}
