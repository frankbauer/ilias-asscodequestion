self.importScripts("worker/runtime.js");

var $stdoutBuffer = "";
var $stderrBuffer = "";

var $rt_global = {
    id : '',
    $rt_putStdout : function(ch) {
        if (ch === 0xA) {
            self.postMessage({ command: "stdout", line: $rt_stdoutBuffer, id:$rt_global.id });
            $rt_stdoutBuffer = "";
        } else {
            $rt_stdoutBuffer += String.fromCharCode(ch);
        }
    },
    $rt_putStderr : function(ch) {
        if (ch === 0xA) {
            self.postMessage({ command: "stderr", line: $stderrBuffer, id:$rt_global.id});
            $stderrBuffer = "";
        } else {
            $stderrBuffer += String.fromCharCode(ch);
        }
    }
};

self.addEventListener("message", function(event) {    
    var request = event.data;
    console.log(request);
    if (request.command == 'run') {    
        $rt_global.id = request.id;            
        var blob = new Blob([request.code], {type: 'application/javascript'});            
        self.importScripts(URL.createObjectURL(blob));
        self.postMessage({ command: "run-finished-setup", id:request.id });  
              
        main();
        if ($stderrBuffer != '') self.postMessage({ command: "stderr", line: $stderrBuffer, id:request.id });
        if ($stdoutBuffer != '') self.postMessage({ command: "stdout", line: $stdoutBuffer, id:request.id }); 
        
        self.postMessage({ command: "run-completed", id:request.id });      
    }
});

