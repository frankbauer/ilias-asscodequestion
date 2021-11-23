let args = {}
let result = undefined

self.importScripts('./pyodide-0.17.0/pyodide.js')
self.importScripts('./codeblocks.js')
CodeBlocks.worker = self
const olog = console.log
const oerr = console.error
const clog = function (...args) {
    olog('[Worker]', ...args)
}
const cerr = function (...args) {
    oerr('[Worker]', ...args)
}

CodeBlocks._endSession = function () {
    self.postMessage({ command: 'finished', args: args, result: result })
    close()
}

function parseError(err) {
    const traceback = []
    let deepest = undefined
    let msg = ''
    if (err.message) {
        if (err.message.indexOf('Traceback') >= 0) {
            const ep =
                /File\s*"(\S*?)",\s*line\s*(\d*),\s*in\s*(\S.*)|File\s*"(\S*?)",\s*line\s*(\d*)/gm
            let m

            while ((m = ep.exec(err.message)) !== null) {
                if (m.index === ep.lastIndex) {
                    ep.lastIndex++
                }

                if (m.length >= 4) {
                    if (m[2] && m[1] && m[3]) {
                        traceback.push({ line: m[2] - 1, file: m[1], module: m[3] })
                    } else if (m[4] && m[5]) {
                        traceback.push({ line: m[5] - 1, file: m[4] })
                    }
                }
            }

            deepest = traceback.reverse().find((t) => t.file === '<exec>' || t.file === '<unknown>')
        }

        const lines = err.message.trim().split('\n')
        if (lines.length > 0) {
            msg = lines[lines.length - 1]
        }
    }

    const res = {
        message: msg,
        trace: traceback,
        deepest: deepest,
    }
    if (deepest) {
        self.postMessage({
            command: 'exception',
            text: msg,
            lineNumber: deepest.line,
            severity: 'ERROR',
        })
    }
    cerr('EEEE', res.trace.map((t) => JSON.stringify(t)).join('\n'), res.message, res.deepest)
    return res
}

async function listener(input) {
    const o = input.data
    const script = o.code
    let dict = undefined

    if (typeof self.__pyodideLoading === 'undefined') {
        await loadPyodide({ indexURL: './pyodide-0.17.0/' })
        dict = pyodide.globals.get('dict')
    }

    switch (input.data.command) {
        case 'session-ended':
            CodeBlocks._endSession()
            break
        // case 'importD3':
        //     clog('[Importing D3-Proxy]')
        //     self.importScripts('./d3DomProxy.js') //to be included before d3
        //     self.importScripts('../../d3/5.3.8/d3.v5.min.js')
        //     __whitelist.add('d3')
        //     __whitelist.add('document')
        //     break
        // case 'importBrain':
        //     clog('[Importing Brain.JS]')
        //     self.importScripts('../../brain.js/2.0.0-alpha/brain-browser.min.js')

        //     var brain = window.brain
        //     this.brain = window.brain
        //     __whitelist.add('brain')
        //     __whitelist.add('window')
        //     break
        case 'start':
            args = o.args
            this.args = args

            //postMessage(['finished', func(args), args])
            if (o.messagePosting) {
                self.postMessage({ command: 'main-will-start', id: o.id })
            }

            try {
                let globals = dict()
                if (args) {
                    globals.set('args', self.pyodide.toPy(args))
                }
                pyodide.runPython(
                    `import sys
import io
sys.setrecursionlimit(200)
sys.stdout = io.StringIO()`,
                    globals
                )
                await pyodide.loadPackagesFromImports(script)

                if (this.console.redirected === undefined) {
                    // custom logging
                    this.console = {
                        log(...s) {
                            clog(...s)
                            if (Array.isArray(s)) {
                                s = s.join(', ')
                            }
                            //postMessage(['log', '' + s])
                            self.postMessage({ command: 'log', s: '' + s })
                        },
                        error(...s) {
                            cerr(...s)
                            if (Array.isArray(s)) {
                                s = s.join(', ')
                            }
                            //postMessage(['err', '' + s])
                            self.postMessage({ command: 'err', s: '' + s })
                        },
                    }
                    this.console.warn = this.console.log
                    self.console = console
                    this.console.redirected = true
                }

                let coroutine = pyodide.pyodide_py.eval_code_async(script, globals)
                try {
                    const output = await coroutine
                    if (output) {
                        clog(output)
                    }
                } catch (err) {
                    parseError(err)
                    this.console.error(err)
                } finally {
                    coroutine.destroy()
                }

                const output = pyodide.runPython('sys.stdout.getvalue()', globals)
                this.console.log(output)

                const nargs = globals.get('args').toJs()
                if (nargs instanceof Map) {
                    args = {}
                    for (var [key, value] of nargs) {
                        args[key] = value
                    }
                } else {
                    args = nargs
                }
            } catch (err) {
                parseError(err)
                this.console.error(err)
            }

            if (o.messagePosting) {
                self.postMessage({ command: 'main-finished', id: o.id, args: args })
            }
            if (!o.keepAlive) {
                CodeBlocks._endSession()
            }
            break
        default:
            clog('FWD', input, input.data)
            CodeBlocks._forward(input.data)
    }
}

self.addEventListener('message', listener.bind(this))
