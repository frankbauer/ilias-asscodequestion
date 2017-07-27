var lastCodeMirrorInstance = []

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function initSolutionBox(useMode){
    
     $(".assCodeQuestionCodeBox").each(function(i, block) {  
        //console.log(block);
        $(block).removeClass('assCodeQuestionCodeBox')
        var myPrev = document.getElementById("pre_"+block.id);
        var prog = myPrev ? myPrev.innerText : '';
         
        var editor = CodeMirror.fromTextArea(block, {
            lineNumbers: true, 
            mode:useMode, 
            theme:"solarized light",
            firstLineNumber: prog.trim()=='' ? 1 : prog.split("\n").length+1
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
        editor.setOption("extraKeys", {
            Tab: function(cm) {
                var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
                cm.replaceSelection(spaces);
            }
        });  
        lastCodeMirrorInstance[block.id] = editor
        var inp = editor.display.input;
        
        /*inp.textarea.name = block.name
        inp.textarea.id = block.id
        block.name = ''
        block.id = ''  
        block.parentNode.removeChild(block)*/
    });
}

function builtinRead(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
    return Sk.builtinFiles["files"][x];
}

function getPythonInTest(questionID){   
    var prog = "";
    var el = document.getElementById("pre_"+questionID);
    if (el) {
        var code = el.innerText
        if (code && code.trim()!='') {
            prog = prog + code + "\n"
        }
    }
    
    prog += lastCodeMirrorInstance[questionID].getDoc().getValue();

    el = document.getElementById("post_"+questionID);    
    if (el) {
        var code = el.innerText
        if (code && code.trim()!='') {
            prog = prog + "\n" + code
        }
    }
    //console.log(prog)
    return prog;
}

function runPythonInTest(questionID){   
    runPython(getPythonInTest(questionID), questionID)
}

/*function runJava(prog){
    JavaPoly.type('com.javapoly.demo.HomepageDemo').then(
        function(HomepageDemo){
            HomepageDemo.compileAndRun(document.getElementById('usercode').value);
        }
    );
}*/

function runPythonInSolution() { 
    $("[name=resultingCode]").each(function(i, block) { 
        block.setAttribute("name", "resultingCodeDone") //mark as processed
        var node = document.getElementById(block.id+"Output")
        var prog = block.innerText;  
        runPython(prog, block.id, node);
    });   
}
function runPython(prog, questionID, mypre=undefined) { 
   prog = prog.replaceAll("\t", "  ")
   
   if (mypre===undefined) {
    mypre = document.getElementById(questionID+"Output");     
   }
   //console.log(prog, mypre)
   
   if (mypre){
    mypre.style.display = '';
    mypre.innerHTML = ''; 
    Sk.pre = mypre.id;
    Sk.configure({output:function(text) {
        mypre.innerHTML = mypre.innerHTML + text; 
        //console.log(text, mypre.innerHTML, mypre)
    }, read:builtinRead, execLimit:1000}); 
    //(Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = 'mycanvas';
    var myPromise = Sk.misceval.asyncToPromise(function() {
        return Sk.importMainWithBody("<stdin>", false, prog, true);
    });
    myPromise.then(function(mod) {
        //console.log('success', mypre.id, mod, mod.$d); 
    },
        function(err) {
             mypre.innerHTML = mypre.innerHTML + '<span style="color:red">'+err.toString()+'</span>';
            //console.log(err.toString());
    });
   }
} 

function runPythonForSave(form, target, questionID){
    try {
        var prog = getPythonInTest(questionID);
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
            //runPythonForSave(form, target, nr);
            return true;
        });
    } catch (err) {
        console.log(err);
    }
}