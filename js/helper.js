var lastCodeMirrorInstance = []

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function format_info(text){
    return '<span style="color:green">'+text+'</span>';
}
function format_error(text){
    return '<span style="color:red">'+text+'</span>';
}
$(document).ready(function(){
    //we need this for the manual scoring view, otherwise the boxes have to get clicked
    setTimeout(function() {
        $.each(editors, function(i, e){            
            e.refresh();
        })
    }, 500);    
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

        /*if ( blockIsReadOnly(block) ){
            ed.setOption('theme', 'xq-light') 
        } else*/ {        
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
    'glsl': 'text/x-glsl', // (GLSL)
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

        const blocknr = block.getAttribute('data-blocknr')
        if (blocknr==0){
            if (qLanguage=='glsl'){
                $('#block_type_0').prop('disabled', 'disabled')
                $('#block_type_0').val(4)
                document.getElementById("block_type_0").selectedIndex = 4;
                selectType(block, block.id, blocknr, false)
            } else {
                $('#block_type_0').prop('disabled', false)
            }
        }
    })   

    updateCodeEditorUI()
}

function resizeBlock(lines, blockID){
    editor = editors[blockID]
    if (editor){
        //console.log('resize', Math.round(20.533*lines)+2)
        editor.setSize(null, Math.round(20*lines)+9);
    }
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
        lineNumbers: blockHasProgramCode(block) || blockIsCanvas(block), 
        mode:useMode,
        theme:"solarized light",
        tabSize: 2,
        autoCloseBrackets: true,
        firstLineNumber: 1 
    }); 
    editor.display.input.textarea.className ="noRTEditor"
    block.setAttribute('data-has-editor', true)
        
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
    
    //must be set before call to resizeBlock
    editors[block.id] = editor

    let lines = block.getAttribute('data-show-lines')
    if (lines!==null && lines>0){
        resizeBlock(lines, block.id);
    }
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
 * @param {*} qLanguage The langua being used (ie "python")
 * @param {*} questionID The id of the question in the test
 */
function initSolutionBox(useMode, qLanguage, questionID){  
    //console.log(useMode, qLanguage, questionID)
    const inQuestionEditMode = $('input#allow_run').length!==0
    
    
    $("textarea[data-question="+questionID+"]").each(function(i, block) {    
        if (block.getAttribute('data-ignore')) return          
        if (block.getAttribute('data-has-editor')) return;  
        var editor = initEditor(block, questionID, useMode)
        //console.log(block.id, editors[block.id], editors, $(block).data('CodeMirrorInstance'))

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
    finishedExecutionWithOutput(undefined, questionID)

    updateLineNumbers(questionID)
    selectTheme()
    selectLanguage()

    updateCodeEditorUI()
}

function isRunnableLanguage(qLanguage){
    return qLanguage === 'python' || qLanguage === 'javascript' || qLanguage === 'java'|| qLanguage === 'glsl';
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
            code += block.innerText+ "\n"   
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
 */
function runJavaScript(questionID, mypre=undefined, prog=undefined){
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
    runJavaScriptWorker( prog, log, maxMS, questionID);
}

function runJava(questionID, mypre=undefined, prog=undefined){
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
    runJavaWorker( prog, log, maxMS, questionID, finishedExecutionWithOutput);
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
        
    var mypre = undefined;
    // This is necessary to intearctively change the language in the edit mode.
    // codeqst_edit_mode is a dummy language set by the PHP-script to avoid
    // collisions with the test and solution mode
    if (language === 'codeqst_edit_mode') {
        language = $('select#source_lang').val();
    }
    switch(language){
        case 'python': runPython(prog, questionID, mypre); break;
        case 'javascript':  runJavaScript( questionID, undefined, prog); break;
        case 'java':  runJava( questionID, undefined, prog); break;
        case 'glsl':  runGLSL( questionID, undefined, prog); break;
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
 * Call when the program finished executing and pass the output string. We will send the output to all embeded canvas elements
 * @param {*} output 
 */
function finishedExecutionWithOutput(output, questionID){
    if (typeof displayResults !== "function"){
        //console.log('displayResults is not available here' );
        return output;
    }

    var parseError = null
    var initialOutput = output

    if (output !== undefined){
        //try to parse JSON
        try {
            output = JSON.parse(output)
        } catch (e){
            parseError = e;        
        }
    }

    if (maxCharacters>0 && (typeof output==='string')){
        //console.log('enforce max', maxCharacters);
        if (output.length > maxCharacters) {
            output = format_info('Info: Removed ' + (output.length-maxCharacters) + ' Characters. \n<b>...</b>') + output.substr(output.length-maxCharacters)
        }
    }

    $("area[data-question="+questionID+"]").each(function(i, block) {  
        //console.log('output', output)
        try {
            const blockID = block.getAttribute('data-blocknr')
            if (parseError!=null && typeof calls !== 'undefined'){
                if (calls[questionID][blockID] && calls[questionID][blockID].onParseError) {
                    calls[questionID][blockID].onParseError(initialOutput, parseError)
                }
            }
            output = displayResults(output, block, questionID, blockID)        
        } catch (e){
            console.error(e);
        }
    })

    if (typeof output!=='string'){
        output = ''        
    }
    
    return output;
}

/**This function will send the code provided by the student directly to the available canvas areas
 * @param {string} questionID 
 * @param {HTML-element} mypre The HTML element to write the standard output of the program
 * @param {string} prog  String containing the Python, Java or JavaScript program
 * 
 */
function runGLSL(questionID, mypre=undefined, prog=undefined){
    var outputData = []
    $("[data-contains-code][data-question="+questionID+"]").each(function(i, block) {
        if (block.getAttribute('data-ignore')) return
        if (!blockHasProgramCode(block)) return
        const editor = editors[block.id]        
        if (editor) {
            outputData.push(block.value)
        } else {
            outputData.push(block.innerHTML)
        }
    });
    finishedExecutionWithOutput(outputData, questionID)
}


/**
 * The function pass the Python program to a worker. The worker runs the program
 * and return the standard output to the main thread.
 * @param {string} prog The Python program
 * @param {string} questionID The id of the question to read the Python program from html page
 * @param {HTML-element} mypre The HTML-element to write the output of the Python program.
 */
function runPython(prog, questionID, mypre=undefined) { 
    // the Python program
    prog = prog.replaceAll("\t", "    ")
   // the HTML-Element to write the output of the Python program
    if (mypre===undefined) {
        mypre = document.getElementById(questionID+"Output");     
    }
    //console.log(prog, mypre);
   
    if (mypre){
        // output mypre.innerHTML = mypre.innerHTML + text; 

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
       
        var messageData = {pyProg: prog, pyInp: pyInp, maxMS: maxMS};
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
                const result = finishedExecutionWithOutput(e.data[1].stdOut, questionID)
                output(''+ result);
                
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

function runJavaScriptWorker( code, log_callback, max_ms, questionID){
    

    //console.log("submit");
    // TODO:: IE.11  does not support default arguments
    //    if(max_ms==undefined) max_ms=50;
    //    if(max_loglength==undefined) max_loglength=2000;
    
    var Log = [];
    var output = function(l){       // wrap the log
        //alert(l);
        if(!log_callback) console.log(l);
        else{            
            Log.push(l);
            log_callback( Log.join('\n') );
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
    
    var outputBuffer = ''
    worker.onmessage = function(e){
        if(executionFinished) return;
        //only accept messages, when worker not terminated (workers do not immetiately terminate)

        testTimeout();
        if( e.data[0] == 'finished' ){
            outputBuffer = finishedExecutionWithOutput(outputBuffer, questionID)
            output(''+ outputBuffer );   
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
            outputBuffer += e.data[1];
                       
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
function selectType(select, elementID, blockNr, languageSelect=true){
    const el = $('[data-blocknr='+blockNr+']')
    const block = el.get()[0];
    const ed = editors[el.attr('id')]
    const themeSelect = $('select#cm_theme');
    const edTheme = themeSelect.val();
    
    el.attr('data-blocktype', select.value)
    ed.setOption('lineNumbers', blockHasProgramCode(block) || blockIsCanvas(block));    
    if ( blockIsReadOnly(block) ){
        ed.setOption('theme', 'xq-light') 
        ed.setOption('theme', edTheme)
    } else {        
        console.log(edTheme)
        ed.setOption('theme', edTheme)
    }
    if (languageSelect) selectLanguage()
    //console.log(select, elementID, el, blockNr, select.value, ed)
}

function initThreeJS(){
    //currently we need no genereal purpose code to set up ThreeJS
}

/**
 * Call this Object from a "Canvas Area" to create an WebGL rendering context. The 'threejs' data-block of the canvasElement will contain an object that provides references to the created scene, renderer and camera.
 * @param {*} canvasElement The dom-element that should contain the canvas
 * @param {function(scene, camera, renderer):void} createSceneCallback  Called when everything is set up, you may use this to set up the actual scene. 
 * @param {function(scene, camera, renderer):void} renderLoopCallback  When defined, a render loop is set up that wil periodically call this function. Otherwise the scene is rendered exactly once. 
 */
function setupThreeJSScene(canvasElement, createSceneCallback, renderLoopCallback=undefined){
    canvasElement = $(canvasElement)

    //cleanup?
    const tjs = canvasElement.data('threejs')
    if (tjs){
        tjs.renderer.dispose()
        tjs.scene.dispose()
        tjs.camera.dispose()
        canvasElement.data('threejs') = undefined
    }

    //get dimension of the container
    const w = canvasElement.width()
    const h = canvasElement.height()

    // Create an empty scene
    var scene = new THREE.Scene();        

    // Create a basic perspective camera
    var camera = new THREE.PerspectiveCamera( 75, w/h, 0.1, 1000 );
    camera.position.z = 4;

    // Create a renderer with Antialiasing
    var renderer = new THREE.WebGLRenderer({antialias:true});

    // Configure renderer clear color
    renderer.setClearColor("#000000");

    // Configure renderer size
    renderer.setSize( w, h );

    // Append Renderer to DOM
    canvasElement.append( renderer.domElement );

    // Create a Cube Mesh with basic material
    createSceneCallback(scene, camera, renderer)

    //Store the Material
    canvasElement.data('threejs', {
        scene:scene,
        renderer:renderer,
        camera:camera
    })
    
    if (renderLoopCallback!==undefined){
        // Render Loop
        var render = function () {
            requestAnimationFrame( render );

            renderLoopCallback(scene, camera, renderer)

            // Render the scene
            renderer.render(scene, camera);
        }   
        render();     
    } else {
        renderer.render(scene, camera);
    }
}

function initD3(){    
    //currently we need no genereal purpose code to set up D3
}

/**
 * Call this Object from a "Canvas Area" to create an D3 context. The 'd3' data-block of the canvasElement will contain an object that provides references to the created context
 * @param {*} canvasElement The dom-element that should contain the canvas
 * @param {function(canvas):void} createSceneCallback  Called when everything is set up, you may use this to set up the actual scene. 
 * @param {*} type svg or canvas
 */
function setupD3Scene( canvasElement, createSceneCallback, type='svg'){
    const domEl = canvasElement
    canvasElement = $(canvasElement)
    const w = canvasElement.width()
    const h = canvasElement.height()
    
    //create the canvas once
    var base = d3.select(canvasElement.get(0));
    var canvas = base.append(type)
        .attr("width", w)
        .attr("height", h);

    // Create stuff
    createSceneCallback(canvas)

    //Store the Material
    canvasElement.data('d3', {
        canvas:canvas
    })
}

//@ sourceURL=helper.js