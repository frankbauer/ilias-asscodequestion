
'use strict';

if ('function' === typeof importScripts) {
    importScripts('./browserfs/browserfs.min.js&?v=003');
    importScripts('./doppio/doppio.js&?v=004');
}

var JavaExec = {
  fs:null,
  options:{},

  initFileSystem : function(baseFolder) {
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
    mfs.mount('/sys', new BrowserFS.FileSystem.XmlHttpRequest('listings.json', baseFolder+'/js/doppio'));

    let options = Doppio.VM.JVM.getDefaultOptions('/sys');
    options.bootstrapClasspath.push("/sys/vendor/classes/"); 
    console.log("options", options); 
    
    JavaExec.options = options;
    JavaExec.fs = fs;
  },

  printDirContent : function(dir){
    JavaExec.fs.readdir(dir, function(err, items) {
      console.log(items);
    
      for (var i=0; i<items.length; i++) {
          console.log(items[i]);
      }
    });
  },

  reroutStdStreams : function(){
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
  },

  runClass : function(className, args, cb) {
    new Doppio.VM.JVM(JavaExec.options, function(err, jvmObject) {
      console.log("here", jvmObject, err);
      jvmObject.runClass(className, args, cb);
    });
  }
};



(function() {
  JavaExec.initFileSystem('./Customizing/global/plugins/Modules/TestQuestionPool/Questions/assCodeQuestion')
  JavaExec.printDirContent('sys/vendor');
  
  let res = JavaExec.fs.readFileSync('/sys/vendor/classes/foo/Foo.class')
  console.log("res", res);

  JavaExec.reroutStdStreams();
      
  setTimeout(function(e){
      JavaExec.runClass('foo.Foo', ['argument1', 'argument2'], function(exitCode) {
        if (exitCode === 0) {
          console.log("All is good");
        } else {
          console.error("Failed")
        }
      });
      
      console.log(Doppio.VM.JVM.getCompiledJDKURL());          
    }, 5);
  

      
  })();