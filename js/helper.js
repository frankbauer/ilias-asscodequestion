var lastCodeMirrorInstance = []

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

$(document).ready(function(){
    
});

/**
 * @function selectTheme
 * This function is called by a select event. It sets the theme for the codemirror editor.
 * This function is only called in edit mode. This is not available for the test mode.
 */
function selectTheme() {
    const themeSelect = $('select#cm_theme');
    const edTheme = themeSelect.val();

    if (edTheme===undefined) return;
    $("textarea[data-question]").each(function(i, block) {  
        const ed = editors[block.id];   
        if (!ed || ed===undefined) return;

        if ( blockIsReadOnly(block) ){
            ed.setOption('theme', 'xq-light') 
        } else {        
            ed.setOption('theme', edTheme)
        }
    })   
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
    const qLanguage = $('select#source_lang').val()
    if (qLanguage===undefined) return;
    const edMode = cmMode[qLanguage]

    $("textarea[data-question]").each(function(i, block) {  
        const ed = editors[block.id];   
        if (!ed) return;
        
        if ( !blockIsCanvas(block) ){
            ed.setOption('mode', edMode)
        } else {        
            ed.setOption('mode', 'text/javascript')
        }
    })   

    updateCodeEditorUI()
}

/**
 * Counts the number of displayed lines within a Textarea fo
 * @param {*} block The Element to count the lines in
 */
function numberOfLinesIn(block){
   let prog = ''
   if (block && block.value) {
    prog = block.value
   } else if (block && block.innerHTML) {
    prog = block.innerHTML
   }
   return prog.split('\n').length
}

function blockHasProgramCode(block){
    const type = block.getAttribute('data-blocktype');
    if (type==0 || type==4 ) return false;
    return true;
}

function blockIsCanvas(block){
    const type = block.getAttribute('data-blocktype');
    if (type==4) return true;
    return false;
}

function blockIsReadOnly(block){
    const type = block.getAttribute('data-blocktype')
    if (block.getAttribute('data-readonly')) return true
    if (type!=2) return true
    return false
}

/**
 * Counts the number of displayed lines within a Textarea fo
 * @param {*} questionID 
 */
function updateLineNumbers(questionID){
    var firstLineNumber = 1
    $("[data-contains-code][data-question="+questionID+"]").each(function(i, block) {
    //$("textarea[data-question="+questionID+"]").each(function(i, block) {
        if (block.getAttribute('data-ignore')) return
        if (!blockHasProgramCode(block)) return

        const editor = editors[block.id]
        if (editor) {
            editor.setOption('firstLineNumber',firstLineNumber);
        } 
        firstLineNumber += numberOfLinesIn(block)      
    });
}

function initEditor(block, questionID, useMode){
    const type = block.getAttribute('data-blocktype');
    var editor = CodeMirror.fromTextArea(block, {
        lineNumbers: blockHasProgramCode(block), 
        mode:useMode,
        theme:"solarized light",
        tabSize: 2,
        autoCloseBrackets: true,
        firstLineNumber: 1 
    }); 
    
    editor.on('change',function(cMirror){
        block.value = cMirror.getValue(); 
    });           
    editor.addKeyMap({
        "Tab": function(cMirror) {
            cMirror.execCommand("insertSoftTab");              
        }
    });
    editor.on('changes', function(cm) {
        updateLineNumbers(questionID)
        return CodeMirror.Pass;
    });

    editors[block.id] = editor
    return editor
}

//maintains a list of active code boxes on the website
const editors = {}
/**
 * @function initSolutionBox
 * This function initialize the editors and set some event handlers
 * to correctly manage the line number in the editors.
 * 
 * @param {string} useMode The langued being used, as a string for CodeMirror (ie "text/x-c++src")
 * @param {*} qLanguage The langua being used (ie "clike")
 * @param {*} questionID The id of the question in the test
 */
function initSolutionBox(useMode, qLanguage, questionID){  
    
    const inQuestionEditMode = $('input#allow_run').length!==0
    
    $("textarea[data-question="+questionID+"]").each(function(i, block) {    
        if (block.getAttribute('data-ignore')) return    
        var editor = initEditor(block, questionID, useMode)

        //make blocks read-only
        if (blockIsReadOnly(block) && !inQuestionEditMode){
            editor.setSize('height','auto')
            editor.setOption('readOnly',true) 
        }

        //chnage look of static code blocks
        if (block.getAttribute('data-blocktype')==1 && !inQuestionEditMode) {             
            editor.setOption('theme', 'xq-light')  
            editor.display.wrapper.style.opacity = 0.8       
            editor.display.wrapper.style.filter = "grayscale(20%)"
        }         
    })

    updateLineNumbers(questionID)
    selectTheme()
    selectLanguage()

    updateCodeEditorUI()
}

function isRunnableLanguage(qLanguage){
    return qLanguage === 'python' || qLanguage === 'javascript' || qLanguage === 'java';
}

/**
 * Make sure the Edit Question UI has all inputs (like Run Checkbox) in the correct state
 */
function updateCodeEditorUI(){
    const qLanguage = $('select#source_lang').val()
    const runnableLanguage = isRunnableLanguage(qLanguage)
    
    //disable the run checkbox for unsupported languages
    const $checkBox = $('input#allow_run');
    if ($checkBox.length > 0) {
        $checkBox.click(function () {
            if ($(this).is(':checked')) {
                const qLanguage = $('select#source_lang').val();
                if (!isRunnableLanguage(qLanguage)) {
                    $(this).prop('checked',false);
                }
            }
        })

        if (!runnableLanguage) {
            $checkBox.prop('checked',false);
        }
    }

    // if Python or JavaScript display the run button
    if ($('input#allow_run_button').length && $('input#allow_run').length) {
        if ($('input#allow_run')[0].checked === true && runnableLanguage) {
            $('input#allow_run_button').css('display','');
        } else {
            $('input#allow_run_button').css('display','none');        
        }
    }
}

/**
 * @function getTotalSourcecode
 * This function collect all parts of the program from
 * the prefix_code, the best_solution or test and the postfix_code
 * @param {string} questionID The id of the question in the test required to collect the students input
 */
function getTotalSourcecode(questionID){
    var code = ''
    $("[data-contains-code][data-question="+questionID+"]").each(function(i, block) {
        if (block.getAttribute('data-ignore')) return
        if (!blockHasProgramCode(block)) return
        const editor = editors[block.id]        
        if (editor) {
            code += block.value + "\n"      
        } else {
            code += block.innerHTML+ "\n"   
        }
    });
    return code
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
    runJavaWorker( prog, log, maxMS, maxLines, questionID);
}

/**
 * @function runInExam
 * This function is called by the input button 'Run' during the test. 
 * According to the implement programming languages will call the worker 
 * for a Python or a JavaScript program
 * @param {string} language 
 * @param {string} questionID 
 */
function runInExam(language, questionID){   
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
        language = $('select#source_lang').val();
    }
    switch(language){
        case 'python': runPython(prog, questionID, mypre, maxMS, maxLines); break;
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
function runInSolution(language, questionID){
    runInExam(language, questionID) 
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

/**
 * Create a new Edit Block in the Question Edit View
 * @param {*} button 
 * @param {*} useMode 
 * @param {*} questionID 
 */
function addBlock(button, useMode, questionID){
    button = $(button)
    
    let maxNr = 0
    $("textarea[data-question]").each(function(i, block) {    
        if (block.getAttribute('data-ignore')) return
        maxNr = Math.max(maxNr, block.getAttribute('data-blocknr'))
    })

    const tpl = $('#blockTemplate')
    let html = tpl.html()    
    html = html.replace(/\[ID\]/g, (maxNr+1))
    html = html.replace(/block_template/g, 'block['+(maxNr+1)+']')
    $(html).insertBefore(button)

    const block = $('#block\\['+(maxNr+1)+'\\]').get()[0]
    block.removeAttribute('data-ignore')
    initEditor(block, questionID, useMode)    
    updateLineNumbers()
    selectTheme()
}

function removeBlock(container, elName){
    const ed = editors[elName]
    if (ed) {
        editors[elName] = undefined
        ed.toTextArea()
    }
    
    if (container){
        container.remove()
    }
}

/**
 * @function selectType
 * @param {*} elementID - The ID of the associated text area
 * Called when the type of a Block-Element should change
 */
function selectType(select, elementID, blockNr){
    const el = $('[data-blocknr='+blockNr+']')
    const block = el.get()[0];
    const ed = editors[el.attr('id')]
    el.attr('data-blocktype', select.value)
    ed.setOption('lineNumbers', blockHasProgramCode(block));
    if ( blockIsReadOnly(block) ){
        ed.setOption('theme', 'xq-light') 
    } else {
        const themeSelect = $('select#cm_theme');
        const edTheme = themeSelect.val();
        console.log(edTheme)
        ed.setOption('theme', edTheme)
    }
    ed.setOption('lineNumbers', blockHasProgramCode(el.get()[0]));
    console.log(select, elementID, el, blockNr, select.value, ed)
}

//@ sourceURL=helper.js