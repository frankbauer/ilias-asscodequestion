var lastCodeMirrorInstance = [];
var SEVERITY_ERROR = 2;
var SEVERITY_WARNING = 1;
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
String.prototype.replaceRec = function (pattern, replacement) {
    var newstr = this.replace(pattern, replacement);
    if (newstr == this)
        return newstr;
    return newstr.replaceRec(pattern, replacement);
};

function format_info(text){
    return '<span style="color:green">'+text+'</span>';
}
function format_error(text){
    return '<span style="color:red">'+text+'</span>';
}

var $executables = {};
/**
 * 
 * @param {*} name The language name in our plugin system
 * @param {*} fktRun the runFunction (see runDummy)
 * @param {*} languageStyle The language name for our highlighters
 */
function registerLanguage(name, fktRun, languageStyle=undefined) {
    if (languageStyle===undefined) languageStyle = name;
    console.log("[registered new language: " + name + "]");
    $executables[name] = {
        name: name,
        run: fktRun,
        style: languageStyle
    };
}

$(document).ready(function(){
    //we need this for the manual scoring view, otherwise the boxes have to get clicked
    setTimeout(function() {
        $.each(editors, function(i, e){            
            e.refresh();
        });
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
    'java2': 'text/x-java', // (Java),
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
    const inQuestionEditMode = $('input#allow_run').length!==0
    const type = block.getAttribute('data-blocktype');
    var editor = CodeMirror.fromTextArea(block, {
        lineNumbers: blockHasProgramCode(block) || blockIsCanvas(block), 
        mode:useMode,
        theme:"solarized light",
        tabSize: 4,
        indentUnit: 4,
        autoCloseBrackets: true,
        firstLineNumber: 1,
        gutters: ["diagnostics", "CodeMirror-linenumbers"]
    }); 
    
    if (editor.display.input.textarea)  {
        editor.display.input.textarea.className = "noRTEditor"
    } 
    block.setAttribute('data-has-editor', true)
        
    editor.on('change',function(cMirror){
        block.value = cMirror.getValue(); 
    })
    
    if (inQuestionEditMode) {
        const buildIt = function (){
            runInExam('codeqst_edit_mode',questionID)
        }
        
        editor.addKeyMap({
           "Cmd-B": function(cMirror) { buildIt() },
            "Ctrl-B": function(cMirror) { buildIt() }
        });
    }

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
        
        //change look of hidden code blocks
        if (block.getAttribute('data-blocktype')==3 && !inQuestionEditMode) {             
            editor.setOption('theme', 'xq-light')  
            $(editor.getWrapperElement()).hide();            
        }
    })
    finishedExecutionWithOutput(undefined, questionID)

    updateLineNumbers(questionID)
    selectTheme()
    selectLanguage()

    updateCodeEditorUI()
}

function isRunnableLanguage(qLanguage){
    return $executables[qLanguage] !== undefined;
    //return qLanguage === 'python' || qLanguage === 'javascript' || qLanguage === 'java'|| qLanguage === 'glsl';
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
 * 
 * @param {string} questionID 
 * @param {string} prog the sourcecode
 * @param {HTML-element} mypre the dom element that receives the output
 * @param {int} maxRuntime time in ms the app is allowed to run
 * @param {function(text)} logCallback called whenever the app writes to stdout. 
 * @param {function(text)} errCallback called whenever the app writes to stderr. 
 * @param {function(error)} compileErrorCallback called whenever a compiletime error occurs. 
 * @param {function(success=true, overrideOutput=undefined)} finishCallback called when execution finished. 
 */
function runDummy(questionID, prog, mypre, maxRuntime, logCallback, infoCallback, errCallback, compileFailedCallback, finishCallback) {    
    if (finishCallback) {        
        console.error("[No actual Runner available!]");
        finishCallback('This language is not supported', questionID);
    }
}

function displayResults(
        outputObject, 
        canvasElement, 
        questionID, 
        blockID, 
        initialOutput=undefined, 
        parseError=undefined, 
        obj=undefined){
    if (obj===undefined && typeof calls !== 'undefined') {
        obj = calls[questionID][blockID]
    }

    if (!canvasElement || canvasElement.length==0 || obj === undefined) return;

    if (parseError!=null && typeof calls !== 'undefined'){
        if (obj.onParseError) {
            obj.onParseError(initialOutput, parseError)
        }
    }

    canvasElement = $(canvasElement)
    canvasElement.removeClass('hiddenBlock')
    if (outputObject===undefined) {            
        obj.init(canvasElement)
    } else {
        const result = obj.update(outputObject, canvasElement)
        if (result!==undefined) outputObject = result
    }
    return outputObject
}

function cleanupCanvasBlockInQuestionEditor(questionID){
    $("playground[data-question="+questionID+"]").each(function(i, block) {
        $(block).remove()
    })

    $("textarea[data-question="+questionID+"][data-blocktype=4]").each(function(i, block) {
        //$html .= '<playground id="'.$id.'" data-question="'.$questionID.'" data-blocknr="'.$i.'" class="assCodeQuestionCanvas"></playground>';	
        const blocknr = block.getAttribute('data-blocknr')
        const area = document.createElement('playground')
        area.setAttribute('data-question', questionID)
        area.setAttribute('data-blocknr', blocknr)
        area.className = 'assCodeQuestionCanvas'
        area.setAttribute('id', 'block['+questionID+']['+blocknr+']')
        area.setAttribute('data-src-id', block.id)
        $(area).insertAfter(block)
    })
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
    const inQuestionEditMode = $('input#allow_run').length!==0
    if (inQuestionEditMode){
        cleanupCanvasBlockInQuestionEditor(questionID)
    }

        
    var mypre = document.getElementById(questionID+"Output");     
    var outdiv = undefined;
    var waitdiv = undefined;  
    if (mypre){
        mypre.style.display = '';
        mypre.innerHTML = '<div id="waiter"><div class="sk-three-bounce"><div class="sk-child sk-bounce1"></div><div class="sk-child sk-bounce2"></div><div class="sk-child sk-bounce3"></div></div></div><div id="out"></div>'; 
        outdiv = mypre.querySelector('#out')
        waitdiv = mypre.querySelector('#waiter')
    }
    

    // This is necessary to intearctively change the language in the edit mode.
    // codeqst_edit_mode is a dummy language set by the PHP-script to avoid
    // collisions with the test and solution mode
    if (language === 'codeqst_edit_mode') {
        language = $('select#source_lang').val();
    }

    let plugin = $executables[language] || {name:language, run:runDummy, style:language};

    var output = '';
    var sansoutput = '';
    var didClip = false;
    function log(text){        
        //console.log("log", text);
        output += text;
        text = text.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
        if (!didClip) {
            if (maxCharacters>0 && output.length > maxCharacters) {
                outdiv.innerHTML += format_info('Info: Output too long. Removed all following Characters. \n<b>...</b>\n\n');
                didClip = true;
            } else {
                outdiv.innerHTML += text;
            }
        }
    } 
    function info(text){
        text = text.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
        text = format_info(text);
        //console.log("nfo", text);
        sansoutput += text; 
        outdiv.innerHTML += text;  
    } 

    function err(text){
        text = text.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
        text = format_error(text);
        //console.log("err", text);
        sansoutput += text; 
        outdiv.innerHTML += text; 
    } 

    clearDiagnostics(questionID);
    gutterSeverity = [];
    gutterElements = [];
    plugin.run(questionID, prog, mypre, maxMS, log, info, err, function(error){
        processDiagnostics(error, questionID, gutterElements, gutterSeverity)    
    }, function(success=true, overrideOutput=undefined){
        waitdiv.innerHTML = '';  
        if (!success) {
            hideGlobalState();  
            setAllRunButtons(true);
            return undefined;      
        }
        var res = finishedExecution(overrideOutput?overrideOutput:output, sansoutput, questionID, outdiv);
        hideGlobalState();  
        setAllRunButtons(true);
        return res;            
    });
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
 * @param {*} infoErrorOutput outpit generated by info or error messages
 */
function finishedExecution(output, infoErrorOutput, questionID, outputDiv){
    const inQuestionEditMode = $('input#allow_run').length!==0    
    var parseError = null
    var initialOutput = output
    var didChangeOutput = false;
    let plygrounds = $("playground[data-question="+questionID+"]");    

    if (output !== undefined && plygrounds.length>0){  
        //console.log("output", output);      
        //try to parse JSON
        try {
            if (output.indexOf('[')!=-1 || output.indexOf('{')!=-1) {
                output = JSON.parse(output);
                didChangeOutput = true;
            } else {
                console.log("Output did neither contain an array nor object.");
            }
        } catch (e){
            parseError = e;        
        }
    }
    var myoutput = output;
    plygrounds.each(function(i, block) {  
        //console.log('output', output, block, inQuestionEditMode)
        try {
            const blockID = block.getAttribute('data-blocknr')
            
            if (!inQuestionEditMode){
                output = displayResults(output, block, questionID, blockID, initialOutput, parseError)
                didChangeOutput = true;
            } else {
                const src = document.getElementById(block.getAttribute('data-src-id'))
                if (src) {
                    const obj = eval( '(function(){ return '+src.value+'})()');
                    displayResults(undefined, block, questionID, blockID, undefined, null, obj)
                    output = displayResults(output, block, questionID, blockID, initialOutput, parseError, obj)
                    didChangeOutput = true;
                }                
            }
        } catch (e){
            console.error(e);
        }
    })

    if (typeof output!=='string'){
        output = ''        
    }

    if (didChangeOutput && myoutput!=output) {
        //console.log("changed output");
        output = output.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
        outputDiv.innerHTML = output;
        outputDiv.innerHTML += infoErrorOutput;
    }
}

/**
 * Call when the program finished executing and pass the output string. We will send the output to all embeded canvas elements
 * @param {*} output 
 */
function finishedExecutionWithOutput(output,  questionID){
    const inQuestionEditMode = $('input#allow_run').length!==0    
    var parseError = null
    var initialOutput = output
    let plygrounds = $("playground[data-question="+questionID+"]");    

    if (output !== undefined && plygrounds.length>0){        
        //try to parse JSON
        try {
            if (output.indexOf('[')!=-1 || output.indexOf('{')!=-1) {
                output = JSON.parse(output);
            } else {
                console.log("Output did neither contain an array nor object.");
            }
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
    
    plygrounds.each(function(i, block) {  
        //console.log('output', output, block, inQuestionEditMode)
        try {
            const blockID = block.getAttribute('data-blocknr')
            
            if (!inQuestionEditMode){
                output = displayResults(output, block, questionID, blockID, initialOutput, parseError)
            } else {
                const src = document.getElementById(block.getAttribute('data-src-id'))
                if (src) {
                    const obj = eval( '(function(){ return '+src.value+'})()');
                    displayResults(undefined, block, questionID, blockID, undefined, null, obj)
                    output = displayResults(output, block, questionID, blockID, initialOutput, parseError, obj)
                }
                
            }
        } catch (e){
            console.error(e);
        }
    })

    if (typeof output!=='string'){
        output = ''        
    }
    
    return output;
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
        //console.log(edTheme)
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


/**
 * Seperates an outputObject (like the one you will get in the update-method of a playground handler) into a string and a json object seperated by a magic String. Returns an object that contains 
 *  <code>outputElement</code> = the HTML element that displays the output
 *  <code>questionID</code> = the ID of the question
 *  <code>json</code> = the JSON object that was sent after the magicString
 *  <code>text</code> = the String that was sent before the magicString
 * @param {*} outputObject  The outputObject generated by the student code
 * @param {*} canvasElement The canvasElement attached to the output
 * @param {*} magicString The seperating String. By default it is '\n\n<JSON>\n'
 */
function processMixedOutput(outputObject, canvasElement, magicString) {
    const qid = canvasElement.attr('data-question');
    const out = $('#'+qid+'Output');    

    if (magicString===undefined) magicString = '\n\n<JSON>\n';
    const idx = outputObject.indexOf(magicString);    
    if (idx >= 0) {
        const str = outputObject.substr(0, idx);
        const json = JSON.parse(outputObject.substr(idx+magicString.length));
        			
        
        return {
            outputElement:out,
            questionID:qid,
            json:json,
            text:str
        };
    } 

    return {
        outputElement:out,
            questionID:qid,
            json:undefined,
            text:outputObject
    };
}

function findUIElements(canvasElement){
    let res = {};
    res.questionID = canvasElement.attr('data-question');
    res.textEdit = $("[data-blocktype=2][data-question="+res.questionID+"]");
    res.stateBox = $("#stateBox[data-question="+res.questionID+"]");
    res.runButton = $("#allow_run_button[data-question="+res.questionID+"]");
    res.runContainer = $("#runContainer[data-question="+res.questionID+"]");
    if (res.textEdit!==undefined) {
        res.editor = editors[res.textEdit.attr('id')];
    } else {
        res.editor = undefined;
    } 
    
    return res;
}

function hideUIElements(canvasElement){
    let res = findUIElements(canvasElement);
    if (res.editor===undefined){
        console.error("Could not find a valid answer Element");
    } else {
        $(res.editor.getWrapperElement()).hide();
        res.runButton.hide();
        res.stateBox.hide();
        if (res.runContainer) res.runContainer.hide();
    }
    return res;
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
function clearDiagnostics(questionID){
    $("[data-contains-code][data-question="+questionID+"]").each(function(i, block) {
        if (block.getAttribute('data-ignore')) return;
        if (!blockHasProgramCode(block)) return;
        const editor = editors[block.id]; 
        
        if (editor) {
            editor.getDoc().clearGutter('diagnostics');
            var allMarks = editor.getDoc().getAllMarks();
            $.each(allMarks, function(idx, e){            
                e.clear();
            })
        }
    });
}
function processDiagnostics(error, questionID, gutterElements, gutterSeverity) {
    //console.log(questionID, error);
    var line = error.start.line;
    
    if (gutterSeverity[line]===undefined || gutterSeverity[line] < error.severity) {
        gutterSeverity[line] = error.severity;
    }
    var gutterClassName = '';
    switch (gutterSeverity[line]) {
        case SEVERITY_ERROR:
            gutterClassName = "exclamation-sign gutter-error";
            break;
        case SEVERITY_WARNING:
            gutterClassName = "warning-sign gutter-warning";
            break;
        default:
            console.error("Unknown Severity", gutterSeverity[line]);
            return;
    }

    var element = gutterElements[line];
    if (element == null) {
        element = document.createElement("span");
        gutterElements[line] = element;
    }
    element.className = "glyphicon glyphicon-" + gutterClassName;

    var title = element.title;
    title = title!='' ? (title + "\n\n" + '- ' + error.message) : ('- ' +error.message);
    element.title = title;    

    $("[data-contains-code][data-question="+questionID+"]").each(function(i, block) {
        if (block.getAttribute('data-ignore')) return;
        if (!blockHasProgramCode(block)) return;
        const editor = editors[block.id];  

        if (editor) {
            var first = editor.getOption('firstLineNumber');
            var last = first + block.value.split(/\r\n|\r|\n/).length - 1;
            //console.log("editor from",first,"to",last);
            
            if (error.start.line+1 >= first && error.start.line+1 <= last) {
                //console.log("Adding Marker for", error);
                editor.getDoc().markText(
                    {line:error.start.line-first + 1, ch:error.start.column}, 
                    {line:error.end.line-first + 1, ch:error.end.column}, 
                    {
                        className:'red-wave',
                        inclusiveLeft:true,
                        inclusiveRight:true,
                        title:error.message                
                    }
                );

                var info = editor.getDoc().lineInfo(error.start.line-first + 1);
                editor.getDoc().setGutterMarker(error.start.line-first + 1, "diagnostics", element);
            }
            
        } else {
         
        }
    });
}


function hideGlobalState(){
    displayGlobalState(null);
}
function displayGlobalState(msg) {
    let waitBoxes = document.querySelectorAll("#stateBox");
    let infoBoxes = document.querySelectorAll("#stateMessageBox");
    //console.log(msg, waitBoxes, infoBoxes)    
    for (let nr in infoBoxes) {
      let box = infoBoxes[nr];
      if (box.id) {
        box.innerHTML = msg;
      }
    }
    for (let nr in waitBoxes) {
      let box = waitBoxes[nr];
      if (box.style) {
        box.style.display = msg === null ? "none" : "inline-block";
      }
    }
}

function setAllRunButtons(enabled, info=undefined){
    $('[type=button][data-question]').each(function(i, runButton){
      if (enabled){
        if (runButton.getAttribute('data-info') != info)
          return
      }
      runButton.disabled = !enabled;
      if (info)
        if (enabled) runButton.removeAttribute('data-info')
        else runButton.setAttribute('data-info', info);
    })    
 };

//@ sourceURL=helper.js