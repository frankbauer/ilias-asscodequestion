/**
 * Web worker to process Python code.
 * The Python code is passed to the SKULPT library, wich is a entirely implementation
 * of Python in JavaScript.
 * Pros:
 *  - If something goes wrong with the passed Python code, the main thread running the
 *    examination will not crash
 * Cons:
 *  - Each time that the student pushes the run-button, the Skulpt libraries must be
 *    loaded and compiled. This requires a fixed budget an processing time, which is
 *    around 100ms
 */
'use strict';

/**
 * Include and start the Skulpt libraries.
 * The main thread starting the worker passes the working directory,
 * therefor, a relative path is sufficient.
 */
if ('function' === typeof importScripts) {
    importScripts('./skulpt/skulpt.min.js');
    importScripts('./skulpt/skulpt-stdlib.js');
}

/**
 * This function is required by Skulpt
 * @param {object} x 
 */
var builtinRead = function(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
    return Sk.builtinFiles["files"][x];
}


/**
 * Wait until a message from main thread. The message must 
 * identify itself. In this case, data is read from the message.
 * @param {event} e 
 */
self.onmessage = function(e) {
    // check if this is the message we are waiting for
    if (e.data[0] === 'b8e493ca02970aeb0ef734556526bf9b') {
        const pyProg   = e.data[1].pyProg;
        const pyInp    = e.data[1].pyInp;
        const legacy   = e.data[1].legacy; //true => Python 2.7  
        let outLines   = '';      

        // if the program was passed to the worker
        // run Python with skulpt
        if (pyProg.length > 0) {
            const outf = function(text) {                 
                outLines += text;                
            }

            let conf = {
                output:outf, 
                read:builtinRead
            };

            if(!legacy) {
                conf.__future__ = Sk.python3                        
                Sk.python3 = true
            }
            Sk.configure(conf); 

            var myPromise = Sk.misceval.asyncToPromise(function() {
                return Sk.importMainWithBody('<stdin>', false, pyProg, true);
            });
            
            myPromise.then(function(mod) {                    
                    let messageData = {finished: 'success', stdOut: outLines};
                    postMessage(['finished', messageData]);
                },
                function(err) {
                    const args = Sk.ffi.remapToJs(err.args);
                    let errObj = { message : err.toString()};
                    if (args.length>0) errObj.message = args[0];

                    if (err.traceback.length>0){
                        errObj.lineno = err.traceback[0].lineno;
                        errObj.colno = err.traceback[0].colno;
                    }
                    
                    postMessage(['err', err.toString(), JSON.stringify(errObj)]);
            });
        }
    }
}