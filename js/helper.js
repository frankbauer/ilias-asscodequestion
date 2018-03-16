var lastCodeMirrorInstance = []

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

$(document).ready(function(){
    var $checkBox = $('input#allow_run');
    if ($checkBox.length > 0) {
        $checkBox.click(function () {
            if ($(this).is(':checked')) {
                var input = $('select#source_lang')['0'];
                var qLanguage = input.options[input.selectedIndex].value;
                if (qLanguage !== 'python' && qLanguage !== 'javascript' && qLanguage !== 'java') {
                    $(this).prop('checked',false);
                } else {
                    if ($('input#allow_run_button').length) {
                        $('input#allow_run_button').css('display','');
                    }
                }
            } else {
                if ($('input#allow_run_button').length) {
                    $('input#allow_run_button').css('display','none');
                }
            }
        });
    }
});

/**
 * @function selectTheme
 * This function is called by a select event. It sets the theme for the codemirror editor.
 * This function is only called in edit mode. This is not available for the test mode.
 */
function selectTheme() {
    var prefEditor = $('.assCodeQuestionCodeBox#code_prefix + .CodeMirror').get(0).CodeMirror;
    var bsolEditor = $('.assCodeQuestionCodeBox#best_solution + .CodeMirror').get(0).CodeMirror;
    var postEditor = $('.assCodeQuestionCodeBox#code_postfix + .CodeMirror').get(0).CodeMirror;
    var input = $('select#cm_theme')['0'];
    var edTheme = input.options[input.selectedIndex].textContent;
    prefEditor.setOption("theme",edTheme);
    bsolEditor.setOption("theme",edTheme);
    postEditor.setOption("theme",edTheme);
}

/**
 * This object defines the programming languages supported for code highlighting
 * using CodeMirror
 * @namespace cmMode The programminglanguages supported
 */
var cmMode = {
    'c': 'text/x-csrc', // (C),
    'c++': 'text/x-c++src', // (C++),
    'c#': 'text/x-csharp', // (C#),
    'css': 'text/css', // (CSS)
    'fortran': 'text/x-fortran', // (Fortran)
    'html': 'text/html', // (HTML)
    'java': 'text/x-java', // (Java),
    'javascript': 'text/javascript', // (JavaScript)
    'objectivec': 'text/x-objectivec', // (Objective-C),
    'perl': 'text/x-perl', // (Perl)
    'php': 'application/x-httpd-php', // (PHP)
    'python': 'text/x-python',// (Python)
    'r': 'text/x-rsrc', //(R)
    'ruby': 'text/x-ruby', // (Ruby)
    'sql': 'text/x-mysql', // (mysql)
    'xml': 'application/xml' //text/html (XML)
};


/**
 * @function selectLanguage
 * This function is called by the input select in the edit mode.
 * The difficulty in the implementation, is to interactively change 
 * the language in the CodeMirror editor and show or hide the
 * 'run' button.
 */
function selectLanguage() {
    var prefEditor = $('.assCodeQuestionCodeBox#code_prefix + .CodeMirror').get(0).CodeMirror;
    var bsolEditor = $('.assCodeQuestionCodeBox#best_solution + .CodeMirror').get(0).CodeMirror;
    var postEditor = $('.assCodeQuestionCodeBox#code_postfix + .CodeMirror').get(0).CodeMirror;
    var input = $('select#source_lang')['0'];
    var edMode = cmMode[input.options[input.selectedIndex].value];
    prefEditor.setOption("mode",edMode);
    bsolEditor.setOption("mode",edMode);
    postEditor.setOption("mode",edMode);
    // if python or javascript show run button
    var qLanguage = input.options[input.selectedIndex].value;
    if (qLanguage === 'python' || qLanguage === 'javascript' || qLanguage === 'java') {
        if ($('input#allow_run')[0].checked === true) {
            // checkbox is checked
            if ($('input#allow_run_button').length) {
                $('input#allow_run_button').css('display','');
            }
        } else {
            // check box is not checked
            if ($('input#allow_run_button').length) {
                $('input#allow_run_button').css('display','none');
            }
        }
    } else {
        $('input#allow_run')[0].checked = false;
        if ($('input#allow_run_button').length) {
            $('input#allow_run_button').css('display','none');
        }
    }

}

/**
 * @function initSolutionBox
 * This function initialize the editors and set some event handlers
 * to correctly manage the line number in the editors. The problem
 * arises, because we have three editors, one with e preamble, called 
 * prefix_code, one with the input of the lecturer in edit mode or the input
 * of the student in test mode, and finaly an editor for the epilog, closing
 * part of the code for test purposes called post_fix. 
 * The pre_fix and post_fix codes can not be changed by the students, they
 * must be readOnly.
 * @param {string} useMode The langued being used, as a string for CodeMirror
 * @param {*} qLanguage The langua being used, quite redundant
 * @param {*} questionID The id of the question in the test
 */
function initSolutionBox(useMode, qLanguage, questionID){
    // remember line nr. of last block
    var firstLineNumber = 0;
    var currentLineNumber = 0;
    var selectTextAres = function(blockid,questionID) {
        if (blockid.indexOf('question'+questionID+'value1') > -1) {
            return true; // examination or preview mode for questionID
        } else if (blockid === 'code_prefix') { 
            return true; // edit mode
        } else if (blockid === 'best_solution') {
            return true; // edit mode
        } else if (blockid === 'code_postfix') {
            return true; // edit mode
        } else {
            return false; // examination of preview mode for different questionID
        }
    }
     $(".assCodeQuestionCodeBox").each(function(i, block) {  
        //if (block.id.indexOf('question'+questionID+'value1') > -1) {
        if ( selectTextAres(block.id,questionID) ) {
            // edit part
            if (qLanguage === 'python' || qLanguage === 'javascript' || qLanguage === 'java') {
                if ( block.id.indexOf('pre_') !== -1) {
                    firstLineNumber = 1;
                    var myPrev = document.getElementById(block.id);
                    prog = myPrev ? myPrev.innerHTML : '';
                    currentLineNumber = prog.split('\n').length;
                } else if (block.id.indexOf('pre_') === -1 && block.id.indexOf('post_') === -1) {
                    firstLineNumber = currentLineNumber + 1;
                    var myPrev = document.getElementById(block.id);
                    prog = myPrev ? myPrev.innerHTML : '';
                    currentLineNumber += prog.split('\n').length;
                } else if (block.id.indexOf('post_') !== -1) {
                    firstLineNumber = currentLineNumber + 1;
                    var myPrev = document.getElementById(block.id);
                    prog = myPrev ? myPrev.innerHTML : '';
                    currentLineNumber = 0; //prog.split('\n').length;
                }
            } else {
                var prog = '';
                var myPrev = $('pre#pre_'+block.id).get(0); //document.getElementById("pre_"+block.id);
                prog = myPrev ? myPrev.innerText : '';
                firstLineNumber =  prog.trim()=='' ? 1 : prog.split("\n").length+1;
            }
            
            var editor = CodeMirror.fromTextArea(block, {
                lineNumbers: true, 
                mode:useMode,
                theme:"solarized light",
                tabSize: 2,
                autoCloseBrackets: true,
                firstLineNumber: firstLineNumber // prog.trim()=='' ? 1 : prog.split("\n").length+1
            });   
            
            // prevent conflicts with tiny
            $('.CodeMirror textarea').addClass('noRTEditor');

            var oid = block.id
            var noChange = false;
            editor.on('change',function(cMirror){
                // get value right from instance
                var yourTextarea = document.getElementById(oid) 
                yourTextarea.value = cMirror.getValue(); 
            });   
            //editor.setOption("extraKeys", {
            editor.addKeyMap({
                "Tab": function(cm) {
                    cm.execCommand("insertSoftTab");
                    //var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
                    //cm.replaceSelection(spaces);
                }
            });
            // adapt editor's height and set readonly if necessary
            if (block.id.indexOf('pre_') !== -1 || block.id.indexOf('post_') !== -1) {
                editor.setSize('height','auto');
                editor.setOption('readOnly',true);
            }

            lastCodeMirrorInstance[block.id] = editor
            var inp = editor.display.input;
        }
    }); // $().each()
    // if Python or JavaScript display the run button
    if ($('input#allow_run_button').length) {
        if (qLanguage === 'python' || qLanguage === 'javascript' || qLanguage === 'java') {
            $('input#allow_run_button').css('display','');
        } else {
            $('input#allow_run_button').css('display','none');
        }
    }
    var $checkBox = $('input#allow_run');
    if ($checkBox.length > 0) {
        $checkBox.click(function () {
            if ($(this).is(':checked')) {
                var input = $('select#source_lang')['0'];
                var qLanguage = input.options[input.selectedIndex].value;
                if (qLanguage !== 'python' && qLanguage !== 'javascript' && qLanguage !== 'java') {
                    $(this).prop('checked',false);
                }
            }
        });
    }
    // set line numbers for the edit part. Each codemirror block appears only once
    if ($('.assCodeQuestionCodeBox#code_prefix + .CodeMirror').length > 0) {
        var prefEditor = $('.assCodeQuestionCodeBox#code_prefix + .CodeMirror').get(0).CodeMirror;
        var bsolEditor = $('.assCodeQuestionCodeBox#best_solution + .CodeMirror').get(0).CodeMirror;
        var postEditor = $('.assCodeQuestionCodeBox#code_postfix + .CodeMirror').get(0).CodeMirror;
        var prefFirstLine = 1;
        var bsolFirstLine = prefEditor.lastLine() + 2;
        var postFirstLine = bsolFirstLine + bsolEditor.lastLine() + 1;
        prefEditor.setOption('firstLineNumnber',prefFirstLine);
        bsolEditor.setOption('firstLineNumber',bsolFirstLine);
        postEditor.setOption('firstLineNumber',postFirstLine);
    }

    // add an event handlers for the 'enter' key to update line numbers
    var prefEditor = undefined;
    var bsolEditor = undefined;
    var postEditor = undefined;
    var bsolFirstLine = 1;
    var postFirstLine = 1;
    if ($('.assCodeQuestionCodeBox#code_prefix + .CodeMirror').length > 0) {
        // we are in the edit mode
        prefEditor = $('.assCodeQuestionCodeBox#code_prefix + .CodeMirror').get(0).CodeMirror;
        bsolEditor = $('.assCodeQuestionCodeBox#best_solution + .CodeMirror').get(0).CodeMirror;
        postEditor = $('.assCodeQuestionCodeBox#code_postfix + .CodeMirror').get(0).CodeMirror;
        // The prefix code area
        prefEditor.on('changes', function(cm) {
            bsolFirstLine = prefEditor.lastLine() + 2;
            postFirstLine = bsolFirstLine + bsolEditor.lastLine() + 1;
            bsolEditor.setOption('firstLineNumber',bsolFirstLine);
            postEditor.setOption('firstLineNumber',postFirstLine);
            return CodeMirror.Pass;
        });
        bsolEditor.on('changes', function(cm) {
            bsolFirstLine = prefEditor.lastLine() + 2;
            postFirstLine = bsolFirstLine + bsolEditor.lastLine() + 1;
            bsolEditor.setOption('firstLineNumber',bsolFirstLine);
            postEditor.setOption('firstLineNumber',postFirstLine);
            return CodeMirror.Pass;
        });
        // prefEditor.setOption("extraKeys", {
        //     "Enter": function(cm) {
        //         bsolFirstLine = prefEditor.lastLine() + 2 + 1;
        //         postFirstLine = bsolFirstLine + bsolEditor.lastLine() + 1;
        //         bsolEditor.setOption('firstLineNumber',bsolFirstLine);
        //         postEditor.setOption('firstLineNumber',postFirstLine);
        //         return CodeMirror.Pass;
        //     },
        //     "Backspace": function(cm) {
        //         var pos = prefEditor.getCursor();
        //         if (pos.ch === 0) {
        //             bsolFirstLine = prefEditor.lastLine() + 1;
        //             postFirstLine = bsolFirstLine + bsolEditor.lastLine() + 1;
        //             bsolEditor.setOption('firstLineNumber',bsolFirstLine);
        //             postEditor.setOption('firstLineNumber',postFirstLine);
        //         }
        //         return CodeMirror.Pass;
        //     }
        // });
        // bsolEditor.setOption("extraKeys", {
        //     "Enter": function(cm) {
        //         bsolFirstLine = prefEditor.lastLine() + 1 + 1;
        //         postFirstLine = bsolFirstLine + bsolEditor.lastLine() + 1 + 1;
        //         bsolEditor.setOption('firstLineNumber',bsolFirstLine);
        //         postEditor.setOption('firstLineNumber',postFirstLine);
        //         return CodeMirror.Pass;
        //     },
        //     "Backspace": function(cm) {
        //         var pos = bsolEditor.getCursor();
        //         if (pos.ch === 0) {
        //             bsolFirstLine = prefEditor.lastLine() + 1 + 1;
        //             postFirstLine = bsolFirstLine + bsolEditor.lastLine();
        //             bsolEditor.setOption('firstLineNumber',bsolFirstLine);
        //             postEditor.setOption('firstLineNumber',postFirstLine);
        //         }
        //         return CodeMirror.Pass;
        //     }
        // });
    } else if ($('.assCodeQuestionCodeBox#pre_question'+questionID+'value1 + .CodeMirror').length > 0) {
        // we are in the test or preview mode
        prefEditor = $('.assCodeQuestionCodeBox#pre_question'+questionID+'value1 + .CodeMirror').get(0).CodeMirror;
        bsolEditor = $('.assCodeQuestionCodeBox#question'+questionID+'value1 + .CodeMirror').get(0).CodeMirror;; 
        postEditor = $('.assCodeQuestionCodeBox#post_question'+questionID+'value1 + .CodeMirror').get(0).CodeMirror;
        bsolFirstLine = prefEditor.lastLine() + 1 + 1;
        bsolEditor.on('changes', function(cm) {
            bsolFirstLine = prefEditor.lastLine() + 2;
            postFirstLine = bsolFirstLine + bsolEditor.lastLine() + 1;
            bsolEditor.setOption('firstLineNumber',bsolFirstLine);
            postEditor.setOption('firstLineNumber',postFirstLine);
            return CodeMirror.Pass;
        });
        // The prefix code area
        // bsolEditor.setOption("extraKeys", {
        //     "Enter": function(cm) {
        //         bsolFirstLine = prefEditor.lastLine() + 1 + 1;
        //         postFirstLine = bsolFirstLine + bsolEditor.lastLine() + 1 + 1;
        //         bsolEditor.setOption('firstLineNumber',bsolFirstLine);
        //         postEditor.setOption('firstLineNumber',postFirstLine);
        //         return CodeMirror.Pass;
        //     },
        //     "Backspace": function(cm) {
        //         var pos = bsolEditor.getCursor();
        //         if (pos.ch === 0) {
        //             bsolFirstLine = prefEditor.lastLine() + 1 + 1;
        //             postFirstLine = bsolFirstLine + bsolEditor.lastLine();
        //             bsolEditor.setOption('firstLineNumber',bsolFirstLine);
        //             postEditor.setOption('firstLineNumber',postFirstLine);
        //         }
        //         return CodeMirror.Pass;
        //     }
        // });
    }
}


/**
 * @function getTotalSourcecode
 * This function collect all parts of the program from
 * the prefix_code, the best_solution or test and the postfix_code
 * @param {string} questionID The id of the question in the test required to collect the students input
 */
function getTotalSourcecode(questionID){   
    var prog = "";
    var el = document.getElementById("pre_"+questionID);
    // if in test mode
    if (el) {
        var code = el.innerText
        if (code && code.trim()!='') {
            prog = prog + code + "\n"
        }
    }else{ // edit mode
        prog = lastCodeMirrorInstance["code_prefix"].getDoc().getValue() + '\n';
    }

    // if in test mode, otherwise collect input from edit mode
    el = lastCodeMirrorInstance[questionID];
    if(!el) el = lastCodeMirrorInstance["best_solution"];  

    if(el){
        prog += el.getDoc().getValue()  + '\n';
    }
    el = document.getElementById("post_"+questionID);
    if (el) {
        var code = el.innerText
        if (code && code.trim()!='') {
            prog = prog + "\n" + code
        }
    }else{
        prog += lastCodeMirrorInstance["code_postfix"].getDoc().getValue();
    }
    return prog;
}




/**
 * @function runJavaScript
 * This function collect the program, the HTML-element to write the program's output
 * and define a log function to print the standard output of the program
 * @param {string} questionID 
 * @param {HTML-element} mypre The HTML element to write the standard output of the program
 * @param {string} prog  String containing the Python, Java or JavaScript program
 * @param {number} maxMS  Timeout to kill the worker
 * @param {numner} maxLines Maximum number of lines allowd in the standard output
 */
function runJavaScript(questionID, mypre=undefined, prog=undefined,maxMS=500, maxLines=20){
    if(!prog) prog = getTotalSourcecode(questionID);
    if (mypre===undefined) {
        mypre = document.getElementById(questionID+"Output");     
    }  
    if (mypre){
        mypre.style.display = '';
        mypre.innerHTML = ''; 
    }
    function log(text){
        mypre.innerHTML = text; 
    }       
    runJavaScriptWorker( prog, log, maxMS, maxLines);
}

function runJava(questionID, mypre=undefined, prog=undefined,maxMS=500, maxLines=20){
    if(!prog) prog = getTotalSourcecode(questionID);
    if (mypre===undefined) {
        mypre = document.getElementById(questionID+"Output");     
    }  
    if (mypre){
        mypre.style.display = '';
        mypre.innerHTML = ''; 
    }
    function log(text){
        mypre.innerHTML = text; 
    }       
    runJavaWorker( prog, log, maxMS, maxLines);
}


function runPythonInTest(questionID){   
    runPython(getTotalSourcecode(questionID), questionID)
}

/*function runJava(prog){
    JavaPoly.type('com.javapoly.demo.HomepageDemo').then(
        function(HomepageDemo){
            HomepageDemo.compileAndRun(document.getElementById('usercode').value);
        }
    );
}*/



/*function runPythonInSolution() { 
    $("[name=resultingCode]").each(function(i, block) { 
        block.setAttribute("name", "resultingCodeDone") //mark as processed
        var node = document.getElementById(block.id+"Output")
        var prog = block.innerText;  
        runPython(prog, block.id, node);
    });   
}*/

/**
 * @function runInTest
 * This function is called by the input button 'Run' during the test. 
 * According to the implement programming languages will call the worker 
 * for a Python or a JavaScript program
 * @param {string} language 
 * @param {string} questionID 
 */
function runInTest(language,questionID){   
    var prog = getTotalSourcecode(questionID);
    var maxLines = parseInt($('#max_lines-'+questionID).val());
    var maxMS = parseInt($('#timeout_ms-'+questionID).val());
    // we don't know, what we get
    if (isNaN(maxLines)) {
        maxLines = 20;
    } 
    if (isNaN(maxMS)) {
        maxMS = 1000;
    } 
    var mypre = undefined;
    // This is necessary to intearctively change the language in the edit mode.
    // codeqst_edit_mode is a dummy language set by the PHP-script to avoid
    // collisions with the test and solution mode
    if (language === 'codeqst_edit_mode') {
        var input = $('select#source_lang')['0'];
        language = input.options[input.selectedIndex].value;
    }
    switch(language){
        case 'python': runPython(prog, questionID,mypre,maxMS,maxLines); break;
        case 'javascript':  runJavaScript( questionID, undefined, prog, maxMS, maxLines); break;
        case 'java':  runJava( questionID, undefined, prog, maxMS, maxLines); break;
    }
}

/**
 * @function runInSolution
 * This function is called by the input button 'Run' during the test. 
 * According to the implement programming languages will call the worker 
 * for a Python or a JavaScript program.
 * @param {string} language 
 */
function runInSolution(language){
    $("[name=resultingCode]").each(function(i, block) { 
        block.setAttribute("name", "resultingCodeDone") //mark as processed
        var node = document.getElementById(block.id+"Output")
        var prog = block.innerText;  

        switch(language){
            case 'python': runPython(prog, block.id, node); break;
            case 'javascript':  runJavaScript( block.id, node, prog); break;
            case 'java':  runJava( block.id, node, prog); break;
        }
    });   
}


/**
 * The function pass the Python program to a worker. The worker runs the program
 * and return the standard output to the main thread.
 * @param {string} prog The Python program
 * @param {string} questionID The id of the question to read the Python program from html page
 * @param {HTML-element} mypre The HTML-element to write the output of the Python program.
 * @param {number} maxMS The timeout for the python program in milliseconds, must be an integer
 * @param {number} maxLines The maximum number of lines allowed in the output, must be an integer
 */
function runPython(prog, questionID, mypre=undefined,maxMS=100,maxLines=20) { 
    // the Python program
    prog = prog.replaceAll("\t", "    ")
   // the HTML-Element to write the output of the Python program
    if (mypre===undefined) {
        mypre = document.getElementById(questionID+"Output");     
    }
    //console.log(prog, mypre);
   
    if (mypre){
        // output mypre.innerHTML = mypre.innerHTML + text; 
        function format_info(text){
            return '<span style="color:green">'+text+'</span>';
        }
        function format_error(text){
            return '<span style="color:red">'+text+'</span>';
        }


        // clear output, set to string to avoid undesired JavaScript snippets
        mypre.innerHTML = '';
        mypre.style.display = ''; // make the code output visible
        
        /**
         * Function to write the output of the code or some other info for the students,
         * e.g. the code does not compile, or there is a timeout
         * @param {string} l Output of the code as text string
         */
        var output = function(l) {
            mypre.innerHTML += l;
        }
        
        if(!window.Worker){
            output(format_error("CRITICAL-ERROR: your browser does not support WebWorkers!! (please consult a Tutor)."));
            return;
        }

        //var urlLoc = {url: document.location.href.substring(0, document.location.href.lastIndexOf("/"))};
        //var path = urlLoc.url+'/data/assCodeQuestion';
        //var path  = './Customizing/global/plugins/Modules/TestQuestionPool/Questions/assCodeQuestion';
        var worker = new Worker('./Customizing/global/plugins/Modules/TestQuestionPool/Questions/assCodeQuestion/js/pyWorker.js');
        //var urlLoc = {url: document.location.href.substring(0, document.location.href.lastIndexOf("/")) + '/'};
        
        // construct message for worker
        var pyInp = []; // not used jet
        if (typeof maxLines === 'number') {
            maxLines = Math.round(maxLines);
        } else {
            maxLines = 20;
        }
        if (typeof maxMS === 'number') {
            maxMS = Math.round(maxMS);
        } else {
            maxMS = 500; // is this enough?
        }
        var messageData = {pyProg: prog, maxLines: maxLines, pyInp: pyInp, maxMS: maxMS};
        worker.postMessage(['b8e493ca02970aeb0ef734555526bf9b',messageData]);
        var start = Date.now();
        
        var testTimeout = function(){    
            var time = Date.now()-start;
            if(time > maxMS){
                worker.end(format_error("TimeoutError:  Execution took too long (> "+time+" ms) and was terminated. There might be an endless loop in your code."));
                return true;
            }
            return false;
        }
        var executionFinished = false;
        worker.end = function(msg){
                if(executionFinished) return;
                worker.terminate();
                executionFinished = true;
                if(msg) output( msg );//"HackerError: Great! You invaded our System. Sadly this will lead you nowhere. Please focus on the Test.");
            }
        worker.onmessage = function(e){
            if(executionFinished) return;
            //only accept messages, when worker not terminated (workers do not immetiately terminate)
            if (testTimeout() === true) { return; }
            if( e.data[0] == 'finished' ){
                output(''+ e.data[1].stdOut);
                worker.end(format_info("Info: Execution finished in : " + (Date.now() - start) + " ms"));
            }else if (e.data[0] ==='err'){
                worker.end(format_error("ERROR: " + e.data[1]));
            }
            else {
                worker.end(format_error("Unknown error: " + e.data[1]));
            }
        }
        // in any case use the window timeout to terminate the worker
        setTimeout(testTimeout,maxMS);
    }
} 



function runPythonForSave(form, target, questionID){
    try {
        var prog = getTotalSourcecode(questionID);
        prog = prog.replaceAll("\t", "  ")
    
        target.value = '';
        Sk.configure({output:function(text) {
            try {
                target.value += text;
            } catch (err) {
                console.log(err);
            }
            //alert("result: " + text + " " + questionID+", "+target)
        }, read:builtinRead, execLimit:1000}); 
        try {
            eval(Sk.importMainWithBody("<stdin>", false, prog));
        }
        catch(err) {
          target.value += '[err]'+err+'[/err]';
        }    
        //Sk.importMainWithBody("<stdin>", false, prog, false);     
    } catch (err) {
        console.log(err);
    }
}

function preparePythonSave(nr){
    try {
        var form = $('#taForm');    
        var target = document.getElementById('question'+nr+'result1');    

        form.submit(function() {
            console.log("Python Save");
            //runPythonForSave(form, target, nr);
            return true;
        });
    } catch (err) {
        console.log(err);
    }
}






function runJavaScriptWorker( code, log_callback, max_ms, max_loglength){
    const maxLineLength = 256;
    function format_info(text){
        return '<span style="color:green">'+text+'</span>';
    }
    function format_error(text){
        return '<span style="color:red">'+text+'</span>';
    }

    //console.log("submit");
    // TODO:: IE.11  does not support default arguments
    //    if(max_ms==undefined) max_ms=50;
    //    if(max_loglength==undefined) max_loglength=2000;
    
    var Log = [];
    var output = function(l){       // wrap the log
        //alert(l);
        if(!log_callback) console.log(l);
        else{
            if (l.length > maxLineLength) {
                l = l.substring(0,maxLineLength);
            }
            Log.push(l);
            log_callback( Log.length>max_loglength ?   format_info('...(first '+(Log.length-max_loglength)+' Logs hidden)...\n') + Log.slice(Log.length-max_loglength,Log.length).join('\n')
                                                    :   Log.join('\n')
            );
        }
    }
    log_callback('');

    if(!window.Worker){
        output(format_error("CRITICAL-ERROR: your browser does not support WebWorkers!! (please consult a Tutor)."));
        return;
    }

    var not_allowed_keywords =['postMessage','close','onmessage','debugger'];      // blacklist (can be evaded, ... see below)
    for(var key in not_allowed_keywords){
        if(code.indexOf(not_allowed_keywords[key]) != -1){        // the user is not allowed to use the functionallity of the WebWorker
            output(format_error("PermissionError: The usage of '"+not_allowed_keywords[key]+"' is not allowed (reserved keyword)!"));
            return;
        }
    }
    var lines = code.split('\n').length;

    // The user-code is sourrounded by webworker start and finish code (one line each)
    // additionally, the console.log fnc is replaced, because the original log fnc is consuming much cpu ressources,
    //      and continues logging, even after the worker was terminated.

    var prefixCode =[
        "for(var c in console) console[c]=null;"   //delete all console functionality
    ,   "for(var t in this) if(t!='close' && t!='postMessage' && t!='console') this[t]=null;"   //delete all worker functionality
    ,   "this.console = {};"
    ,   "console.log = function(s){"                    // only allow .log , .warn and .error
    ,   "   postMessage(['log',''+s]);"
    ,   "};"
    ,   "console.error = console.log;"
    ,   "console.warn = console.log;"
    ,   "onmessage = function(input){"
    ,   "   postMessage(['finished',"
    ,   "   ''+(function(input){"
    ,   "           'use strict';"
    ,   "\n"
    ];
    var postfixCode=[
        "\n"
    ,   "})(input.data[1])]);"
    ,   "   close();"
    ,   "};"
    ];
    code = prefixCode.join('') + code + postfixCode.join('');


    //TODO:: creating a WebWorker from an URL is throwing a SecurityError in  IE 11  ...
    //          is there any workaround?
    var worker = new Worker(URL.createObjectURL(new Blob([code], {type: 'text/javascript'})));
    var executionFinished = false;
    worker.end = function(msg){
        if(executionFinished) return;
        worker.terminate();
        executionFinished = true;
        if(msg) output( msg );//"HackerError: Great! You invaded our System. Sadly this will lead you nowhere. Please focus on the Test.");
    }

    var start = Date.now();
    var testTimeout = function(){    
        var time = Date.now()-start;
        if(time > max_ms){
            worker.end(format_error("TimeoutError:  Execution took too long (>"+time+"ms) and was terminated. There might be an endless loop in your code."));
        }
    }
    
    worker.onmessage = function(e){
        if(executionFinished) return;
        //only accept messages, when worker not terminated (workers do not immetiately terminate)

        testTimeout();
        if( e.data[0] == 'finished' ){
            worker.end(format_info("Info: Execution finished in " + (Date.now() - start) + " ms"));

            //TODO:: perform additional calls to check for hidden testcases

/*
            var result = '' + e.data[1];
            if(typeof expected_result === 'undefined'){
                worker.end("Info: Execution finished.");
            }else{
                worker.end("Info: Execution finished returning '"+result+"'");
                if( result == ''+expected_result )  worker.end("Success:  result is matching expectation.");
                else                                worker.end("NOT Succesful:  result is not matching expectation.");
            }
*/

        }else if(e.data[0]=='log'){
            output(''+ e.data[1] );              
        }else{
            worker.end(format_error("HackerError: Great! You invaded our System. Sadly this will lead you nowhere. Please focus on the Test."));
        }
    }
    worker.onerror   = function(e){         
        //errors before and after the user code are handled specially (to not confuse the user).
        if(e.lineno == 1)             worker.end(format_error("Error: "+e.message));
        else if(e.lineno >= lines+1)  worker.end(format_error("EndOfFile: "+ e.message ));
        else                          worker.end(format_error('Line '+(e.lineno-1)+": "+e.message));
    }
    worker.postMessage(['start',[10,200]]);                                //start worker execution

    setTimeout( testTimeout, max_ms );
}

//@ sourceURL=helper.js