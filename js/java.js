
'use strict';

if ('function' === typeof importScripts) {
    importScripts('./browserfs/browserfs.min.js&?v=003');
    importScripts('./doppio/doppio.js&?v=004');
}

var JavaExec = {
  fs:null,
  options:{},
  persistentFs:null,  

  constructPersistantFs : function(cb) {
      if (BrowserFS.FileSystem.IndexedDB.isAvailable()) {
          var idbfs_1 = new BrowserFS.FileSystem.IndexedDB(function (e, fs) {
              if (e) {
                  cb(new BrowserFS.FileSystem.InMemory());
              }
              else {
                  cb(idbfs_1);
              }
          }, 'doppio-cache');
      }
      else if (BrowserFS.FileSystem.HTML5FS.isAvailable()) {
          var html5fs_1 = new BrowserFS.FileSystem.HTML5FS(100 * 1024 * 1024);
          html5fs_1.allocate(function (e) {
              if (e) {
                  cb(new BrowserFS.FileSystem.InMemory());
              }
              else {
                  cb(html5fs_1);
              }
          });
      }
      else {
          cb(new BrowserFS.FileSystem.InMemory());
      }
  },

  /**
   * Initialize the System
   */
  initialize : function(cb){
    let options = Doppio.VM.JVM.getDefaultOptions('/sys');
    options.bootstrapClasspath.push("/sys/vendor/classes/"); 
    console.log("options", options); 
    
    JavaExec.options = options;

    JavaExec.constructPersistantFs(function (_fs) {
      console.log("Created Persistent FS");
      JavaExec.persistentFs = _fs;
      BrowserFS.initialize(_fs); 
      cb();
    });
  },

  /**
   * Create the runtime filesystem in the browser
   */
  _initFileSystem : function(baseFolder) {
    console.log("Load regular Fileystem")
      var mfs = new BrowserFS.FileSystem.MountableFileSystem()
      BrowserFS.initialize(mfs);

      mfs.mount('/sys', JavaExec.persistentFs);
      
      // Temporary storage.
      mfs.mount('/tmp', new BrowserFS.FileSystem.InMemory());
      
      // 10MB of writable storage
      // Use BrowserFS's IndexedDB file system for more storage.
      //mfs.mount('/home', new BrowserFS.FileSystem.LocalStorage());
      
      // The first argument is the filename of the listings file
      // The second argument is the relative URL to the folder containing the listings file
      // and the data it indexes.
      // In this example, the listings file and DoppioJVM's data is at
      // <thiswebpage>/doppio/listings.json
      // mfs.mount('/sys', new BrowserFS.FileSystem.XmlHttpRequest('listings.json', baseFolder+'/js/doppio'));

      
  },

  /**
   * Download a single file into memory
   */
  download : function(what, cb, type) {
      var xhr = new XMLHttpRequest();
      var startTime = (new Date()).getTime();
      xhr.open('GET', what);
      if (type===undefined) type = "arraybuffer";
      xhr.responseType = type;
      xhr.addEventListener('progress', function (e) {
          var time = (new Date()).getTime();
          var loaded = e.loaded;
          var total = e.total;
          // KB/s
          var rate = (loaded >> 10) / ((time - startTime) / 1000);
          var remaining = (total - loaded) >> 10;
          var remainingTime = Math.floor(remaining / rate);
          var remainingMinutes = Math.floor(remainingTime / 60);
          var remainingSeconds = remainingTime % 60;
          var percent = ((loaded / total) * 100) | 0;
          //console.log("Progress", what, percent)
          /*progressBarText.text("Downloading doppio_home.zip at " + rate.toFixed(2) + " KB/s [" + (loaded >> 10) + " KB / " + (total >> 10) + " KB] (" + remainingMinutes + "m" + remainingSeconds + "s remaining)");
          progressBar.attr('aria-valuenow', percent);
          progressBar.css('width', percent + "%");*/
      });
      xhr.addEventListener('load', function (e) {
          //console.log("Downloaded", what, e, xhr)          
          cb(null, xhr.response);
      });
      xhr.addEventListener('error', function (e) {
          console.log("Error downloading", what, e)
          cb(e, null);
      });
      xhr.addEventListener('abort', function (e) {
        console.log("Aborted Download", what, e)
        cb({error:"Aborted Download"}, null);
      });
      xhr.send();
  },
  _mkdir:function(name, cb, list){
    if (list===undefined) list = [];    
    if (name==='/' || name==='') {
      let doMake = function(e){
        if (list.length>0){
          let what = list.pop();
          //console.log("mkdir", what);
          JavaExec.fs.mkdir(what, doMake)
        } else {
          cb()
        }
      }
      doMake(null);
      return;
    }

    list.push(name);
    let Path = BrowserFS.BFSRequire('path');

    let nname = Path.dirname(name);
    JavaExec._mkdir(nname, cb, list);    
  },

  /**
   * Load All files listed in listings.js in the doppio folder
   */
  loadFiles : function(targetFolder, sourceFolder, callWhenFinished) {
    let files = [];
    
    let process = function(object, base) {      
      for(var key in object) {
        let val = object[key]
        let name = base+'/'+key;
        if (val===null){    
          //console.log("Added File", key, name, sourceFolder+'/'+name, targetFolder + '/' + name)          
          files.push({
            relPath:name,
            absPath:sourceFolder+'/'+name,          
          })          
        } else {
          process(val, name)
        }
      }
    }

    //load file index
    JavaExec.download(sourceFolder+"/listings.json", function(err, buffer){
      let Buffer = BrowserFS.BFSRequire('buffer').Buffer;
      let Path = BrowserFS.BFSRequire('path');
      if (err != null){
        console.error("Error downloading listings.json", err.error);
        return;
      }

      //create FileList of loadable files
      process(buffer, '');
      let counter = files.length
      console.log("Found", counter);
      
      for(let fileIdx in files){
        let file = files[fileIdx];
        let target = Path.join(targetFolder, file.relPath);
        JavaExec.fs.lstat(target,function(e, stats){
          if (stats){
            //console.log("found file", target, stats)
            counter--;
            if (counter==0) callWhenFinished();
            return;
          }
          JavaExec.download(file.absPath, function (fileErr, fileBuffer){
            if (fileErr == null){
              let b = new Buffer(fileBuffer);
              console.log(file, fileBuffer, b, Path.dirname(target));
              let onWritten = function(err){                
                if (err) console.error("Error writing File", err);
                //else console.log("written", err, target, JavaExec.fs.existsSync(target), stats) 
                
                counter--;
                if (counter==0) {
                  callWhenFinished();
                  return;
                }                
              }
              JavaExec._mkdir(Path.dirname(target), function(){
                JavaExec.fs.writeFile(target, b, onWritten);                  
              });
              
            } else {              
              console.error(fileErr.error)
              counter--;
              if (counter==0) {
                callWhenFinished();
                return;
              }
            }            
          }) //download  
        }) //lstat
      }
    }, "json")
  }, 

  /**
   * First download all files from the java home, then set up the runtime filesystem in the browser
   */
  initFileSystems : function(baseFolder, cb) {   
    var fs = BrowserFS.BFSRequire('fs');
    JavaExec.fs = fs;

    var mfs = new BrowserFS.FileSystem.MountableFileSystem();
    mfs.mount('/persist', JavaExec.persistentFs);
    BrowserFS.initialize(mfs);
    
    JavaExec.loadFiles('/persist', baseFolder+'/js/doppio', function() {
      JavaExec._initFileSystem(baseFolder)    
      cb()
    });
  },

  printDirContent : function(dir){
    console.log(dir)
    JavaExec.fs.readdir(dir, function(err, items){
      if (err) return;
      for (var i=0; i<items.length; i++) {
        let real = dir + '/' + items[i];             
        JavaExec.printDirContent(real);         
      }
    })
      
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
  },

  javac : function(args, cb) {
    new Doppio.VM.JVM(JavaExec.options, function(err, jvmObject) {      
      jvmObject.runClass('util.Javac', args, cb);
    });
  }
};



(function() {
  JavaExec.initialize(function(){
    console.log("Initializing Filesystem", JavaExec.persistentFs);
    JavaExec.initFileSystems('./Customizing/global/plugins/Modules/TestQuestionPool/Questions/assCodeQuestion', function(){
      //JavaExec.printDirContent('sys/vendor');      

      JavaExec.reroutStdStreams();
      
      console.time('javac');
      JavaExec.javac(['/sys/vendor/classes/foo/Foo.java'], function(ecode) {console.log('finished with', ecode);console.timeEnd('javac');})
      
      console.time('run');
      JavaExec.runClass('foo.Foo', ['test', 1], function(exitCode) {
        if (exitCode === 0) {
          console.log("All is good");
        } else {
          console.error("Failed")
        }
        console.timeEnd('run')
      });

    })
  })

      
  })();