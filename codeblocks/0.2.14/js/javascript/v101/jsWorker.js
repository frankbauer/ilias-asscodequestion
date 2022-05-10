const __whitelist = new Set([
    'args',
    'close',
    'postMessage',
    'console',
    'performance',
    'setTimeout',
])
var window = {}
var args = {}

onmessage = function (input) {
    switch (input.data[0]) {
        case 'importD3':
            console.log('[Importing D3-Proxy]')
            importScripts('./d3DomProxy.js') //to be included before d3
            importScripts('../../d3/5.3.8/d3.v5.min.js')
            __whitelist.add('d3')
            __whitelist.add('document')
            break
        case 'importBrain':
            console.log('[Importing Brain.JS]')
            importScripts('../../brain.js/2.0.0-alpha/brain-browser.min.js')

            var brain = window.brain
            this.brain = window.brain
            __whitelist.add('brain')
            __whitelist.add('window')
            break
        case 'start':
            const o =
                input && input.data && input.data.length > 0
                    ? input.data[1]
                    : { code: '', args: {} }

            const script = o.code
            args = o.args
            window.args = args
            this.args = args

            //erase all worker functionality from the global scope (except whitelist)
            for (let t in this) {
                if (!__whitelist.has(t)) {
                    this[t] = null
                }
            }
            // custom logging
            this.console = {
                log(...s) {
                    if (Array.isArray(s)) {
                        s = s.join(' ')
                    }
                    postMessage(['log', '' + s])
                },
                error(...s) {
                    if (Array.isArray(s)) {
                        s = s.join(' ')
                    }
                    postMessage(['err', '' + s])
                },
            }
            console.warn = console.log

            let func = new Function('args', '"use strict";' + script)
            postMessage(['finished', func(args), args])
            close()
            break
    }
}.bind(this)
