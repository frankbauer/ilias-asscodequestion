self.importScripts("worker/runtime.js");

var $stderrBuffer = "";
var $stdoutBuffer = "";

var $rt_global = {
    id : '',
    $rt_putStdout : function(ch) {        
        if (ch === 0xA) {
            self.postMessage({ command: "stdout", line: $stdoutBuffer, id:$rt_global.id });
            $stdoutBuffer = "";
        } else {
            $stdoutBuffer += String.fromCharCode(ch);
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



function listener(event) {    
    let request = event.data;
    //console.log(request);
    if (request.command == 'run') {                    
        $rt_global.id = request.id;

        let blob = new Blob([request.code], {type: 'application/javascript'});       let URLObject =  URL.createObjectURL(blob);    
        self.importScripts(URLObject);
        self.postMessage({ command: "run-finished-setup", id:request.id });  
        
        main();
        
        if ($stderrBuffer != '') self.postMessage({ command: "stderr", line: $stderrBuffer, id:request.id });
        if ($stdoutBuffer != '') self.postMessage({ command: "stdout", line: $stdoutBuffer, id:request.id }); 
        
        self.postMessage({ command: "run-completed", id:request.id }); 

        URLObject = undefined;
        blob = undefined;
        $stderrBuffer = undefined;
        $stdoutBuffer = undefined;
        self.removeEventListener("message", listener);     
    }
    request = undefined;
}

self.addEventListener("message", listener);

