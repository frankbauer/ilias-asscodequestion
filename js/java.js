
'use strict';

if ('function' === typeof importScripts) {
    importScripts('./browserfs/browserfs.min.js&?v=003');
    importScripts('./doppio/doppio.js&?v=004');
}

(function() {
  var mfs = new BrowserFS.FileSystem.MountableFileSystem(),
        fs = BrowserFS.BFSRequire('fs');
    BrowserFS.initialize(mfs);
    // Temporary storage.
    mfs.mount('/tmp', new BrowserFS.FileSystem.InMemory());
    // 10MB of writable storage
    // Use BrowserFS's IndexedDB file system for more storage.
    mfs.mount('/home', new BrowserFS.FileSystem.LocalStorage());
    // The first argument is the filename of the listings file
    // The second argument is the relative URL to the folder containing the listings file
    // and the data it indexes.
    // In this example, the listings file and DoppioJVM's data is at
    // <thiswebpage>/doppio/listings.json
    mfs.mount('/sys', new BrowserFS.FileSystem.XmlHttpRequest('listings.json', './Customizing/global/plugins/Modules/TestQuestionPool/Questions/assCodeQuestion/js/doppio'));

    
        let options = Doppio.VM.JVM.getDefaultOptions('/sys');
        console.log("options", options);
        
        // Otherwise, BrowserFS is ready to use!
        console.log("loaded", fs);
        fs.readdir('/sys/vendor/', function(err, items) {
          console.log(items);
       
          for (var i=0; i<items.length; i++) {
              console.log(items[i]);
          }
        });

        let res = BrowserFS.BFSRequire('fs').readFileSync('/sys/vendor/classes/foo/Foo.class')
        console.log("res", res);

        // Grab BrowserFS's 'process' module, which emulates NodeJS's process.
      var process = BrowserFS.BFSRequire('process');
      // Initialize TTYs; required if needed to be initialized immediately due to
      // circular dependency issue.
      // See: https://github.com/jvilk/bfs-process#stdinstdoutstderr
      process.initializeTTYs();
      var stdoutBuffer = '';
      process.stdout.on('data', function(data) {
        stdoutBuffer += data.toString();
        var newlineIdx;
        while ((newlineIdx = stdoutBuffer.indexOf("\n")) > -1) {
          console.log(stdoutBuffer.slice(0, newlineIdx));
          stdoutBuffer = stdoutBuffer.slice(newlineIdx + 1);
        }
      });
      var stderrBuffer = '';
      process.stderr.on('data', function(data) {
        stderrBuffer += data.toString();
        var newlineIdx;
        while ((newlineIdx = stderrBuffer.indexOf("\n")) > -1) {
          console.error(stderrBuffer.slice(0, newlineIdx));
          stderrBuffer = stderrBuffer.slice(newlineIdx + 1);
        }
      });
      // Write text to standard in.
      process.stdin.write('Some text');


        options.bootstrapClasspath.push("/sys/vendor/classes/");        
        console.log("options2", options);
        setTimeout(function(e){
          
            new Doppio.VM.JVM(options, function(err, jvmObject) {
                // here you can use jvmObject as Java Virtual Machine
                console.log("here", jvmObject, err);
                jvmObject.runClass('foo.Foo', ['argument1', 'argument2'], function(exitCode) {
                  if (exitCode === 0) {
                    console.log("All is good");
                  } else {
                    console.error("Failed")
                  }
                });
              });
            console.log(Doppio.VM.JVM.getCompiledJDKURL());          
          }, 5);
  

      
  })();