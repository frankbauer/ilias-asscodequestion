var lastCodeMirrorInstance = null

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function initSolutionBox(useMode){
     $("[class=assCodeQuestionCodeBox]").each(function(i, block) {  
        var editor = CodeMirror.fromTextArea(block, {
            lineNumbers: true, 
            mode:useMode, theme:"solarized dark"
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
function printToOutput(text) { 
    var mypre = document.getElementById("output"); 
    mypre.innerHTML = mypre.innerHTML + text; 
} 

function builtinRead(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
    return Sk.builtinFiles["files"][x];
}

function runPythonInTest(questionID){   
    var prog = document.getElementById("assCodeQuestionPreBox").innerText+"\n";
    //prog += document.getElementById(questionID).value+"\n";
    prog += lastCodeMirrorInstance.getDoc().getValue()+"\n";
    prog += document.getElementById("assCodeQuestionPostBox").innerText;    
    
    //runPython(prog)
    runJava("")
}

function runJava(prog){
    JavaPoly.type('com.javapoly.demo.HomepageDemo').then(
        function(HomepageDemo){
            HomepageDemo.compileAndRun(document.getElementById('usercode').value);
        }
    );
}

function runPythonInSolution() { 
   var prog = document.getElementById("resultingCode").innerText;  
   runPython(prog);
}
function runPython(prog) { 
   prog = prog.replaceAll("\t", "aaaa")
   //alert(prog);
   var mypre = document.getElementById("output"); 
   mypre.innerHTML = ''; 
   Sk.pre = "output";
   Sk.configure({output:printToOutput, read:builtinRead}); 
   (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = 'mycanvas';
   var myPromise = Sk.misceval.asyncToPromise(function() {
       return Sk.importMainWithBody("<stdin>", false, prog, true);
   });
   myPromise.then(function(mod) {
       console.log('success');
   },
       function(err) {
        printToOutput('<span style="color:red">'+err.toString()+'</span>');
        console.log(err.toString());
   });
} 