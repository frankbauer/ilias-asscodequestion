let args = {}
let result = undefined

self.importScripts('./pyodide-0.17.0/pyodide.js')
self.importScripts('./codeblocks.js')
self.importScripts('./phaser.js')

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
let globals = undefined
async function listener(input) {
    const o = input.data
    const script = o.code
    let dict = undefined

    if (typeof self.__pyodideLoading === 'undefined') {
        await loadPyodide({ indexURL: './pyodide-0.17.0/' })
        dict = pyodide.globals.get('dict')
        globals = dict()
    }

    switch (input.data.command) {
        case 'session-ended':
            CodeBlocks._endSession()
            globals.destroy()
            break
        case 'initialize':
            // eslint-disable-next-line no-case-declarations
            let codeBlocksNamespace = {
                // eslint-disable-next-line no-undef
                CodeBlocks: CodeBlocksClient,
                Phaser: PhaserInterop,
            }

            pyodide.registerJsModule('fau_gdi', codeBlocksNamespace)
            pyodide.registerJsModule('fau_gdi_phaser', PhaserInterop)
            pyodide.runPython(
                `import sys
import io
sys.setrecursionlimit(200)
sys.stdout = io.StringIO()`,
                globals
            )
            self.postMessage({ command: 'finished-init', id: o.id })
            break
        case 'preload-imports':
            //await pyodide.loadPackage(o.names, (msg) => clog('Preloading Import: ' + msg))
            break
        case 'interpreter':
            let run_complete = pyconsole.run_complete
            try {
                const incomplete = pyconsole.push(o.code)
                self.postMessage({
                    command: 'interpreter',
                    sub: 'did-push',
                    incomplete: incomplete,
                    id: o.id,
                })
                let r = await run_complete
                if (pyodide.isPyProxy(r)) {
                    r.destroy()
                }
                self.postMessage({
                    command: 'interpreter',
                    sub: 'finished',
                    incomplete: incomplete,
                    id: o.id,
                })
            } catch (e) {
                if (e.name !== 'PythonError') {
                    self.postMessage({
                        command: 'interpreter',
                        sub: 'exception',
                        fatal: false,
                        value: e,
                        id: o.id,
                    })
                }
            }
            run_complete.destroy()
            break
        case 'start':
            args = o.args
            this.args = args

            //postMessage(['finished', func(args), args])
            if (o.messagePosting) {
                self.postMessage({ command: 'main-will-start', id: o.id })
            }

            try {
                if (args) {
                    globals.set('args', self.pyodide.toPy(args))
                }

                await pyodide.loadPackagesFromImports(script)
                self.postMessage({
                    command: 'loaded-imports',
                    id: o.id,
                    names: Object.keys(pyodide.loadedPackages),
                })

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
            } else if (o.withREPL) {
                const namespace = pyodide.globals.get('dict')()
                namespace.set('runnerSpace', globals)
                pyodide.runPython(
                    `    
    import sys
    import js
    from pyodide import console
    class PyConsole(console._InteractiveConsole):
        def __init__(self):
            super().__init__(
                runnerSpace,
                persistent_stream_redirection=False,
            )            

        def banner(self):
            return f"Welcome to the Pyodide terminal emulator 🐍\\n{super().banner()}"
    
    
    js.pyconsole = PyConsole()
    `,
                    namespace
                )
                namespace.destroy()
                pyconsole.stdout_callback = (s) =>
                    self.postMessage({
                        command: 'interpreter',
                        sub: 'out',
                        value: s,
                        id: o.id,
                    })

                pyconsole.stderr_callback = (s) => {
                    self.postMessage({
                        command: 'interpreter',
                        sub: 'err',
                        value: s.trimEnd(),
                        id: o.id,
                    })
                }

                pyodide._module.on_fatal = async (e) => {
                    self.postMessage({
                        command: 'interpreter',
                        sub: 'exception',
                        value: `Pyodide has suffered a fatal error. Please report this. The cause of the fatal error was:
                            ${e}`,
                        fatal: true,
                        id: o.id,
                    })
                }
            }

            break
        default:
            clog('FWD', input, input.data)
            CodeBlocks._forward(input.data)
    }
}

self.addEventListener('message', listener.bind(this))
