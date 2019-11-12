import Vue from 'vue'


/**
 * The overhead time we need to spin up the execution environment. The value is added to the execution time defined for this question
 * @type {int} javaRunOverhead execution overhead in ms
 */
var javaRunOverhead = 4000;

function runJavaWorker(questionID, code, mypre, max_ms, log_callback, info_callback, err_callback, compileFailedCallback, finishedExecutionCB, forceReload=false) {    
  let exp = new RegExp("public[ \n]*class[ \n]*([a-zA-Z_$0-9]*)[ \n]*(\{|implements|extends)");
  let match = exp.exec(code);
  if (match == null) {
    console.error("Unable to determine class Name!", match, code);
    return;
  }

  let className = match[1];

  let worker = new Worker('js/doppio/v001/javaWorker.js');
  let timer = null

  worker.addEventListener('message', function (e) {
    const data = e.data
    //console.log(data)
    switch (data.event) {
      case 'finished':
        if (timer) {
          clearTimeout(timer)
          timer = null
        }
        
        /*if (data.stderr && data.stderr != '') err_callback(data.stderr + "\n") ;
        if (data.stdout && data.stdout != '') log_callback(data.stdout);*/
        
        console.log("Done", data.stdout, data.stderr, finishedExecutionCB);
        finishedExecutionCB();
        break;

      case 'startTimer':
        timer = setTimeout(function (e) {
          console.log("Sending kill command")
          worker.postMessage({ cmd: 'kill' })
          timer = setTimeout(function(){
            console.log("Terminating Worker")
            worker.terminate()            
          }, 5000);
          err_callback("Terminated long running Process (>"+Math.round((max_ms + javaRunOverhead)/1000)+"s).");
            JavaExec.setRunButton(true, 'run');
            JavaExec.setRunButton(true);
            JavaExec.showMessage(null);
        }, max_ms + javaRunOverhead) //we need about 4000ms to spin up the execution unit
        break

      case 'showMessage':
        //console.log("showMessage", data)
        JavaExec.showMessage(data.msg)
        break
        case 'output':
          if (data.type=='err'){
            err_callback(data.msg);
          } else if (data.type=='nfo'){
            info_callback(data.msg);
          } else {
            log_callback(data.msg);
          }
          break

      case 'setRunButton':
        //console.log("setRunButton", data)
        JavaExec.setRunButton(data.enabled, data.info)
        break

      case 'cleanCache':
        //log_callback('')
        if (!forceReload) {
          worker.postMessage({ cmd: 'kill' })
          console.log("Restarting...")
          setTimeout(function(){
            runJavaWorker(questionID, code, mypre, max_ms, log_callback, info_callback, err_callback, compileFailedCallback, finishedExecution, true);            
          }, 500)
        } else {
          JavaExec.setRunButton(false)
          JavaExec.showMessage("Failed to initialize JVM.")
        }
        break
    }


  }, false);

  worker.postMessage({ cmd: 'run', code: code, className: className, max_ms: max_ms+1000, questionID:questionID, forceReload:forceReload })
}

const singleton = new Vue({
  data: function () {
      return {
          loadedlibs: 0,
          version: "001",
          language: "pyjavathon",    
          canRun: true,
          didPreload: false,
          requestedPreload: false,
          isReady: false,
          isRunning: false
      }
  },
  methods: {
      preload() {
        if (this.loadedlibs<3){
          this.requestedPreload = true;
          return;
        }
        if (this.didPreload) return;
        this.didPreload = true;
        console.log("[Preloading Doppio]");
        try {
          JavaExec.showMessage = function (msg) {
            this.$compilerState.displayGlobalState(msg);
          }.bind(this);
          
          const lock = [];
          JavaExec.setRunButton = function (enabled, info=undefined) { 
            if (info && !enabled && lock.indexOf(info)==-1) lock.push(info);       
            if (info && enabled && lock.indexOf(info)>-1) lock.splice( lock.indexOf(info), 1);

            if (!enabled || lock.length == 0)
              this.$compilerState.setAllRunButtons(enabled);              
          }.bind(this);

          const self = this;
          JavaExec.initialize(function () {
            console.log("Initializing Filesystem");
            JavaExec.initFileSystems('./js/doppio/v001/', false, function () {
              //JavaExec.printDirContent('sys/vendor');      
      
              JavaExec.reroutStdStreams();
              JavaExec.ready = true;
              self.isReady = true;
            });
          });
        } catch (e){
          console.error(e);
        }
      },
      compileAndRun(questionID, code, mypre, max_ms, log_callback, info_callback, err_callback, compileFailedCallback, finishedExecutionCB, runCreate = false){
          if (!this.isReady) return; 

          return runJavaWorker(questionID, code, mypre, max_ms, log_callback, info_callback, err_callback, compileFailedCallback, finishedExecutionCB, runCreate);
      }
  },
  created(){
    let script = document.createElement('script');
    script.src = './js/doppio/v001/browserfs/browserfs.min.js';
    script.onload = function () {
      this.loadedlibs++;
      console.log("[BrowserFS loaded]");
      if (this.requestedPreload) this.preload();
    }.bind(this);
    document.head.appendChild(script);

    script = document.createElement('script');
    script.src = './js/doppio/v001/doppio/doppio.js';
    script.onload = function () {
      this.loadedlibs++;
      console.log("[Doppio loaded]");
      if (this.requestedPreload) this.preload();
    }.bind(this);
    document.head.appendChild(script);

    script = document.createElement('script');
    script.src = './js/doppio/v001/JavaExec.js';
    script.onload = function () {
      this.loadedlibs++;
      console.log("[JavaExec loaded]");
      if (this.requestedPreload) this.preload();
    }.bind(this);
    document.head.appendChild(script);
  }
})
export default singleton;