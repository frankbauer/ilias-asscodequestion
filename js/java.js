
/**
 * The overhead time we need to spin up the execution environment. The value is added to the execution time defined for this question
 * @type {int} javaRunOverhead execution overhead in ms
 */
var javaRunOverhead = 4000;
function runJavaWorker(code, log_callback, max_ms, questionID, finishedExecutionWithOutputCb) {
  function format_info(text) {
    return '<span style="color:green">' + text + '</span>';
  }
  function format_error(text) {
    return '<span style="color:red">' + text + '</span>';
  }

  let exp = new RegExp("public[ \n]*class[ \n]*([a-zA-Z_$0-9]*)[ \n]*(\{|implements|extends)");
  let match = exp.exec(code);
  if (match == null) {
    console.error("Unable to determine class Name!", match, code);
    return;
  }

  log_callback('<div class="sk-three-bounce"><div class="sk-child sk-bounce1"></div><div class="sk-child sk-bounce2"></div><div class="sk-child sk-bounce3"></div>');

  let className = match[1];

  let worker = new Worker('./Customizing/global/plugins/Modules/TestQuestionPool/Questions/assCodeQuestion/js/javaWorker.js');
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

        const outputBuffer = finishedExecutionWithOutputCb(data.stdout, questionID);
        let tex = '';
        if (data.stderr && data.stderr != '') tex += format_error(data.stderr) + "\n";
        if (data.stdout && data.stdout != '') tex += format_info(outputBuffer);
        log_callback(tex)
        //console.log("Done", data.stdout, data.stderr);
        break

      case 'startTimer':
        timer = setTimeout(function (e) {
          console.log("Sending kill command")
          worker.postMessage({ cmd: 'kill' })
        }, max_ms + javaRunOverhead) //we need about 4000ms to spin up the execution unit
        break

      case 'showMessage':
        //console.log("showMessage", data)
        JavaExec.showMessage(data.msg)
        break

      case 'setRunButton':
        //console.log("setRunButton", data)
        JavaExec.setRunButton(data.enabled, data.info)
        break
    }


  }, false);

  worker.postMessage({ cmd: 'run', code: code, className: className, max_ms: max_ms+1000, questionID:questionID })
}

(function () {
  JavaExec.initialize(function () {
    console.log("Initializing Filesystem", JavaExec.persistentFs);
    JavaExec.initFileSystems('./Customizing/global/plugins/Modules/TestQuestionPool/Questions/assCodeQuestion', function () {
      //JavaExec.printDirContent('sys/vendor');      

      JavaExec.reroutStdStreams();
      JavaExec.ready = true;
    })
  })
})();