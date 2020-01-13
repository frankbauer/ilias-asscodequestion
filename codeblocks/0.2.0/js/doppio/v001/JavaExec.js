'use strict';

var JavaExec = {
  fs: null,
  options: {},
  persistentFs: null,
  ready: false,
  running: false,
  initializing: false,
  initialized: false,
  terminate: null,

  constructPersistantFs: function (cb) {
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
  initialize: function (cb) {
    if (JavaExec.initializing) return;
    if (JavaExec.initialized) {
      console.log("No Initialization needed!")
      cb();
      return;
    }
    JavaExec.initializing = true;
    let options = Doppio.VM.JVM.getDefaultOptions('/sys');
    //options.bootstrapClasspath.push("/sys/classes/"); 
    options.classpath = ["/tmp", "/sys/classes"];
    options.nativeClasspath = ["/sys/natives"];
    //console.log("options", options);

    JavaExec.options = options;

    JavaExec.constructPersistantFs(function (_fs) {
      console.log("Created Persistent FS");
      JavaExec.persistentFs = _fs;
      BrowserFS.initialize(_fs);
      cb();
      JavaExec.initialized = true;
      JavaExec.initializing = false;      
    });
  },

  /**
   * Create the runtime filesystem in the browser
   */
  _initFileSystem: function (baseFolder) {
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

  setRunButton: function(enabled, info=undefined){
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
  },

  showMessage: function (msg) {
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
  },

  /**
   * Download a single file into memory
   */
  download: function (what, cb, type) {
    let Path = BrowserFS.BFSRequire('path');
    var xhr = new XMLHttpRequest();
    var startTime = (new Date()).getTime();
    xhr.open('GET', what);
    if (type === undefined) type = "arraybuffer";
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
      console.log("<b>Downloading</b> " + Path.basename(what) + " (" + percent + "%)");
      JavaExec.showMessage("<b>Downloading</b> " + Path.basename(what) + " (" + percent + "%)");
    });
    xhr.addEventListener('load', function (e) {
      //console.log("Downloaded", what, e, xhr)         
      cb(null, xhr.response);
    });
    xhr.addEventListener('error', function (e) {
      console.error("Error downloading", what, e)
      cb(e, null);
    });
    xhr.addEventListener('abort', function (e) {
      console.error("Aborted Download", what, e)
      cb({ error: "Aborted Download" }, null);
    });
    xhr.send();
  },
  _mkdir: function (name, cb, list) {
    if (list === undefined) list = [];
    if (name === '/' || name === '') {
      let doMake = function (e) {
        if (list.length > 0) {
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

  _recursiveRm: function (dir, cb) {
    const Path = BrowserFS.BFSRequire('path');
    const fs = JavaExec.fs

    const deleteFile = function (dir, file) {
      return new Promise(function (resolve, reject) {
        var filePath = Path.join(dir, file);
        fs.lstat(filePath, function (err, stats) {
          if (err) {
            return reject(err);
          }
          if (stats.isDirectory()) {
            resolve(deleteDirectory(filePath, true));
          } else {
            fs.unlink(filePath, function (err) {
              if (err) {
                return reject(err);
              }
              resolve();
            });
          }
        });
      });
    }; //deleteFile

    function deleteDirectory(dir, delMe) {
      return new Promise(function (resolve, reject) {
        fs.exists(dir, function (exist) {
          if (!exist) {
            return reject("");
          }
          fs.readdir(dir, function (err, files) {
            if (err) {
              return reject(err);
            }
            Promise.all(files.map(function (file) {
              return deleteFile(dir, file);
            })).then(function () {
              if (!delMe) {
                resolve();
              } else {
                fs.rmdir(dir, function (err) {
                  if (err) {
                    return reject(err);
                  }
                  resolve();
                });
              }
            }).catch(reject);
          });
        });
      });
    };//deleteDirectory

    deleteDirectory(dir, false).then(function () {
      cb(null)
    }).catch(function (err) {
      JavaExec.printDirContent(dir)
      cb(err)
    })
  },

  /**
   * Load All files listed in listings.js in the doppio folder
   */
  loadFiles: function (targetFolder, sourceFolder, forceReload, callWhenFinished) {
    let files = [];

    let process = function (object, base) {
      for (var key in object) {
        let val = object[key]
        let name = base + '/' + key;
        if (val === null) {
          //console.log("Added File", key, name, sourceFolder+'/'+name, targetFolder + '/' + name)          
          files.push({
            relPath: name,
            absPath: sourceFolder + '/' + name,
          })
        } else {
          process(val, name)
        }
      }
    }

    let iAmDone = function (info=undefined) {
      JavaExec.showMessage(null);
      callWhenFinished();
      JavaExec.setRunButton(true)      
    }

    JavaExec.showMessage("Preparing <b>Java</b> Environment");
    //load file index
    JavaExec.download(sourceFolder + "/cleanListings.json?v=" + Date.now(), function (err, buffer) {
      let Buffer = BrowserFS.BFSRequire('buffer').Buffer;
      let Path = BrowserFS.BFSRequire('path');
      if (err != null) {
        console.error("Error downloading listings.json", err.error);
        return;
      }

      let downloadFiles = function () {
        //create FileList of loadable files
        process(buffer.listings, '');
        let counter = files.length
        //console.log("Found", counter);

        for (let fileIdx in files) {
          let file = files[fileIdx];
          let target = Path.join(targetFolder, file.relPath);
          JavaExec.fs.lstat(target, function (e, stats) {
            if (stats) {
              //console.log("found file", target, stats)
              counter--;
              if (counter == 0) iAmDone();
              return;
            }
            JavaExec.download(file.absPath, function (fileErr, fileBuffer) {
              if (fileErr == null) {
                JavaExec.showMessage("<b>Writing</b> " + Path.basename(file.absPath));
                let b = new Buffer(fileBuffer);
                //console.log("processing", file, fileBuffer, b, Path.dirname(target));
                let onWritten = function (err) {
                  if (err) console.error("Error writing File", err);
                  //else console.log("written", err, target, JavaExec.fs.existsSync(target), stats) 

                  counter--;
                  if (counter == 0) {
                    iAmDone();
                    return;
                  }
                }
                JavaExec._mkdir(Path.dirname(target), function () {
                  JavaExec.fs.writeFile(target, b, onWritten);
                });

              } else {
                console.error(fileErr.error)
                counter--;
                if (counter == 0) {
                  iAmDone();
                  return;
                }
              }
            }) //download  
          }) //lstat
        }
      }

      JavaExec.showMessage("Checking Info File");
      const infoFilename = Path.join(targetFolder, "cleanListings.json")

      let prepAndStartDownloads = function (clearAll) {
        let storeIndexBufferAndDownload = function () {
          JavaExec.fs.writeFile(infoFilename, JSON.stringify(buffer), function (err) {
            downloadFiles()
          })
        }

        if (clearAll) {
          JavaExec.showMessage("<b>Clear</b> Cached Data");
          JavaExec._recursiveRm(targetFolder, function (err) {
            if (err) console.error(err)
            storeIndexBufferAndDownload()
          })
        } else {
          storeIndexBufferAndDownload()
        }

      }

      JavaExec.fs.exists(infoFilename, function (exists) {
        let clearAll = false;
        //file does not exist => restart entire upload
        if (!exists || forceReload) { console.log("rebuilding JVM", exists, forceReload); prepAndStartDownloads(true); }
        else {
          JavaExec.fs.readFile(infoFilename, function (err, infoBuffer) {
            try {
              infoBuffer = JSON.parse(infoBuffer)              
              //console.log("Check Date", infoBuffer.date, buffer.date, infoBuffer.date < buffer.date)
              prepAndStartDownloads(infoBuffer.date < buffer.date);
            } catch (e) {
              console.error(e);
              prepAndStartDownloads(true);
            }
          })
        }

      })
    }, "json")
  },

  /**
   * First download all files from the java home, then set up the runtime filesystem in the browser
   */
  initFileSystems: function (baseFolder, forceReload, cb) {
    var fs = BrowserFS.BFSRequire('fs');
    JavaExec.fs = fs;

    var mfs = new BrowserFS.FileSystem.MountableFileSystem();
    mfs.mount('/persist', JavaExec.persistentFs);
    BrowserFS.initialize(mfs);
    //console.log(baseFolder + '/doppio');
    JavaExec.loadFiles('/persist', baseFolder + '/doppio', forceReload, function () {
      JavaExec._initFileSystem(baseFolder)
      cb()
    });
  },

  printDirContent: function (dir) {
    console.log(dir)
    JavaExec.fs.readdir(dir, function (err, items) {
      if (err) return;
      for (var i = 0; i < items.length; i++) {
        let real = dir + '/' + items[i];
        JavaExec.printDirContent(real);
      }
    })

  },

  outputStream: '',
  errorStream: '',
  combinedStream: '',

  clearStdStreams: function () {
    JavaExec.outputStream = '';
    JavaExec.errorStream = '';
    JavaExec.combinedStream = '';
  },
  reroutStdStreams: function () {
    function format_info(text) {
      return '<span style="color:green">' + text + '</span>';
    }
    function format_error(text) {
      return '<span style="color:red">' + text + '</span>';
    }

    // Grab BrowserFS's 'process' module, which emulates NodeJS's process.
    var process = BrowserFS.BFSRequire('process');
    // Initialize TTYs; required if needed to be initialized immediately due to
    // circular dependency issue.
    // See: https://github.com/jvilk/bfs-process#stdinstdoutstderr
    process.initializeTTYs();

    var stdoutBuffer = '';
    process.stdout.on('data', function (data) {
      stdoutBuffer += data.toString();
      JavaExec.combinedStream += data.toString();
      JavaExec.outputStream += data.toString();
      JavaExec.log(data.toString());
      var newlineIdx;
      while ((newlineIdx = stdoutBuffer.indexOf("\n")) > -1) {
        console.log(stdoutBuffer.slice(0, newlineIdx));
        stdoutBuffer = stdoutBuffer.slice(newlineIdx + 1);
      }
    });

    var stderrBuffer = '';
    process.stderr.on('data', function (data) {
      stderrBuffer += data.toString();
      JavaExec.combinedStream += format_error(data.toString());
      JavaExec.errorStream += data.toString();
      JavaExec.logError(data.toString());
      var newlineIdx;
      while ((newlineIdx = stderrBuffer.indexOf("\n")) > -1) {
        console.error(stderrBuffer.slice(0, newlineIdx));
        stderrBuffer = stderrBuffer.slice(newlineIdx + 1);
      }
    });

    // Write text to standard in.
    //process.stdin.write('Some text');
  },

  _whenReady(cb) {
    if (JavaExec.ready) {
      cb()
    } else {
      setTimeout(JavaExec._whenReady.bind(null, cb), 100)
    }
  },

  runClass: function (className, args, cb) {
    JavaExec._whenReady(function () {
      new Doppio.VM.JVM(JavaExec.options, function (err, jvmObject) {
        console.log("here", jvmObject, err);
        jvmObject.runClass(className, args, cb);
      })
    })
  },

  javac: function (args, cb) {
    JavaExec._whenReady(function () {
      new Doppio.VM.JVM(JavaExec.options, function (err, jvmObject) {
        console.log("jvm", err, jvmObject);
        let className = '';
        JavaExec.showMessage("<b>Compiling</b> " + className + " (this will take a while...)");
        jvmObject.runClass('util.Javac', args, cb);
        
      })
    })
  },

  
  _compileAndRunClass: null,
  compileAndRun: function (code, className, max_ms, whenFinished, beforeExecuting, onCacheFail) {
    if (!className || !code) {
        console.error("Nothing to do");
        return
    }
    let Path = BrowserFS.BFSRequire('path');
    let iAmDone = function (stdout, stderr) {
      JavaExec.showMessage(null);
      whenFinished(stdout, stderr);
      JavaExec.setRunButton(true, 'run')
      JavaExec.running = false;
    }

    JavaExec.setRunButton(false, 'run')  
    
    if (JavaExec.running) {
      alert("Please wait for the last Java-Process to finish...");
      console.error("Already Running");
      return;
    }
    JavaExec.clearStdStreams();
    JavaExec.running = true;
    JavaExec.killed = false;
    JavaExec.showMessage("<b>Writing</b> " + className);
    let javaFile = Path.join('/tmp', className + ".java");

    console.time('javac');
    console.time('run');
    JavaExec.fs.writeFile(javaFile, code, function (err) {
      if (err) throw err;
      JavaExec.showMessage("<b>Preparing JVM</b>");

      JavaExec._whenReady(function () {
        new Doppio.VM.JVM(JavaExec.options, function (err, jvmObject) {
          //console.log("jvm", err, jvmObject);
          if (err){
            JavaExec.terminate = null;
            console.log("Error Initializing JVM:", err);
            JavaExec.setRunButton(true, 'run')
            JavaExec.setRunButton(false)
            JavaExec.cacheFail = true
            console.timeEnd('javac');
            console.timeEnd('run');
            JavaExec.showMessage("Error initializing JVM, rebuilding...");
                        
            JavaExec.running = false;               
            onCacheFail(err);      
            return;
          }
          let _compileAndRunWithClass = function (cls) {
            var cdataStatics =  cls.getConstructor(jvmObject.firstThread);
            //console.log("cdataStatics?", cdataStatics, jvmObject, Doppio)
            let compile = cdataStatics['compile(Ljava/lang/String;Ljava/lang/String;)I'];
            let run = cdataStatics['run(Ljava/lang/String;)I'];
            if (compile && run) {
              let p1 = Doppio.VM.Util.initString(jvmObject.getBootstrapClassLoader(), className)
              let p2 = Doppio.VM.Util.initString(jvmObject.getBootstrapClassLoader(), javaFile)              
             
              compile(jvmObject.firstThread, [p1, p2], function(e, ecode){
                //console.log('finished with', e, ecode);
                console.timeEnd('javac');
                
                if (JavaExec.errorStream === undefined || JavaExec.errorStream == '') {
                  JavaExec.showMessage("<b>Executing</b> " + className);

                  JavaExec.terminate = function(){
                    console.log("Terminating...")
                    JavaExec.showMessage("<b>Terminating</b> " + className);
                    jvmObject.halt(0);
                  }

                  if (beforeExecuting){
                    beforeExecuting()
                  }                  

                  run(jvmObject.firstThread, [p1], function(e, exitCode){
                    JavaExec.terminate = null
                    if (exitCode === 0) {
                      //console.log("All is good");
                    } else {
                      console.error("Failed to Run " + className, exitCode)
                    }
                    /*if (JavaExec.outputStream && JavaExec.outputStream != '')
                      console.log(JavaExec.outputStream)
                    if (JavaExec.errorStream && JavaExec.errorStream != '')
                      console.error(JavaExec.errorStream)*/
                    console.timeEnd('run')
                    iAmDone(JavaExec.combinedStream, '')
                  })
                } else { //if errorStream
                  console.error("Compiler Failed", JavaExec.errorStream)
                  iAmDone(JavaExec.outputStream, JavaExec.errorStream)
                } //else errorStream
              });              
            } else {
              console.error("INTERNAL ERROR: Did not find compile-method")
              iAmDone("", "INTERNAL ERROR: Did not find compile-method")
            }
          }

          JavaExec.showMessage("<b>Compiling</b> " + className + " (this will take a while...)");    
          /*if (JavaExec._compileAndRunClass){
            //we need to unload the compiled class here!
            _compileAndRunWithClass(JavaExec._compileAndRunClass); 
          } else*/ {     
            jvmObject.systemClassLoader.initializeClass(jvmObject.firstThread, 'Lutil/CompileAndRun;', (cls) => {                        
              JavaExec._compileAndRunClass = cls;
              _compileAndRunWithClass(cls);            
            });
          }
          
        })
       
      })    
    })
  },
  log(msg){

  },
  logError(msg){

  },
  logInfo(msg){

  }
};