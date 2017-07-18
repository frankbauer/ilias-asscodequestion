var lastCodeMirrorInstance = null

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function initSolutionBox(useMode){
    
     $(".assCodeQuestionCodeBox").each(function(i, block) {  
         console.log(block);
        var myPrev = document.getElementById("assCodeQuestionPreBox");
        var prog = myPrev ? myPrev.innerText : '';
         
        var editor = CodeMirror.fromTextArea(block, {
            lineNumbers: true, 
            mode:useMode, 
            theme:"solarized light",
            firstLineNumber: prog.split("\n").length+1
        });   
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
        lastCodeMirrorInstance = editor
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
    var prog = document.getElementById("assCodeQuestionPreBox").innerText+"\n";
    //prog += document.getElementById(questionID).value+"\n";
    prog += lastCodeMirrorInstance.getDoc().getValue()+"\n";
    prog += document.getElementById("assCodeQuestionPostBox").innerText;    
    
    return prog;
}

function runPythonInTest(questionID){   
    runPython(getPythonInTest(questionID))
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
        runPython(prog, node);
    });   
}
function runPython(prog, mypre=undefined) { 
   prog = prog.replaceAll("\t", "  ")
   //alert(prog);
   if (mypre===undefined) {
    mypre = document.getElementById("output"); 
    //console.log(mypre)
   }
   
   if (mypre){
    mypre.innerHTML = ''; 
    Sk.pre = mypre.id;
    Sk.configure({output:function(text) {
        mypre.innerHTML = mypre.innerHTML + text; 
    }, read:builtinRead}); 
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
        }, read:builtinRead}); 
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
            runPythonForSave(form, target, nr);
            return true;
        });
    } catch (err) {
        console.log(err);
    }
}