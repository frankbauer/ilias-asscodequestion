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
 * The Python program to be run.
 * @type {string} pyProg is the Python program
 */
var pyProg = '';
/**
 * The maximum number of lines allowed in the standard out of the
 * program. This is necessary for the case, an long or even infinite 
 * loop prints outpurs to the standard output. We set a default value of 
 * 20 lines in the output.
 * Only the first maxLines of the output are given back to the main thread.
 * @type {number} maxLines must be an integer.
 */
var maxLines = 20;

/**
 * The maximum number of character allowed in a line of output. This is intended
 * to avoid creating huge outputs in case of a programming error.
 * This size will be set here. At the moment is not configurable.
 * @type {number} maxLineLength must be an integer.
 */
var maxLineLength = 256;

/**
 * Maximum time allow for the Python program to run and produce a result.
 * This is necessary to avoid infinite loops or other kind of unexpected bugs.
 * The timeout is given in milliseconds (ms)
 * @type {number} Timeout must be an integer to compare with Date.now()
 */
var maxMS    = 1000;
/**
 * The standard output of the program. The output is collected into an array of strings.
 * The number of entries in the array corresponds to the max. number of lines allowed
 * in the output.
 * @type {array} An array of string containing the lines of output
 */
var pyOut = [];
/**
 * String to collect a line of standard output
 * @type {string}
 */
var outLine = '';
/**
 * Some input for the program. This variable is not used at the moment
 * @type {array}
 */
var pyInp = '';
/**
 * Keep track when the worker started to measure the running time.
 * The time is measured in milliseconds
 */
var start = Date.now();

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
    if (e.data[0] === 'b8e493ca02970aeb0ef734555526bf9b') {
        pyProg   = e.data[1].pyProg;
        maxLines = e.data[1].maxLines;
        pyInp    = e.data[1].pyInp;
        maxMS    = e.data[1].maxMS;

        // if the program was passed to the worker
        // run Python with skulpt
        if (pyProg.length > 0) {
            // process more the maxLines lines of output
            // keep the first maxLines
            var outf = function(text) { 
                //if (pyOut.split(/\r\n|\r|\n/).length <= maxLines) {
                //     pyOut += text; 
                // };
                if (text !== '\n') {
                    // collect line elements
                    outLine += text;
                } else {
                    // collect line into output
                    outLine += text;
                    pyOut.push(outLine);
                    outLine = '';
                }
                if (pyOut.length > (maxLines)) {
                    pyOut.shift();
                }
            }
            Sk.configure({output:outf, read:builtinRead}); 
            var myPromise = Sk.misceval.asyncToPromise(function() {
                return Sk.importMainWithBody('<stdin>', false, pyProg, true);
            });
            
            myPromise.then(function(mod) {
                    // construct data message and send it to main thrad
                    //var messageData = {finished: 'success', stdOut: pyOut};
                    if (pyOut.length >= maxLines) { 
                        pyOut.unshift('last ' + maxLines + ' lines of standard output\n');
                    }
                    pyOut.forEach( function(s,index) {
                        if (s.length > maxLineLength) {
                            pyOut[index] = s.substring(0,maxLineLength) + '\n';
                        }
                    });
                    var messageData = {finished: 'success', stdOut: pyOut.join('')};
                    postMessage(['finished',messageData]);
                },
                function(err) {
                    const args = Sk.ffi.remapToJs(err.args);
                    let errObj = { message : err.toString()};
                    if (args.length>0) errObj.message = args[0];

                    if (err.traceback.length>0){
                        errObj.lineno = err.traceback[0].lineno;
                        errObj.colno = err.traceback[0].colno;
                    }
                    // console.log(err.toString(), args)
                    // err.traceback.forEach( e => console.log(e))
                    // there were some error
                    postMessage(['err',err.toString(), JSON.stringify(errObj)]);
            });
        }
    }
}