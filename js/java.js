
function runJavaWorker(code, log_callback, max_ms, max_loglength) {
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
  //console.log(code, className, log_callback, max_ms, max_loglength);
  /*JavaExec.compileAndRun(code, className, max_ms, function (stdout, stderr) {
    let tex = '';
    if (stderr && stderr != '') tex += format_error(stderr) + "\n";
    if (stdout && stdout != '') tex += format_info(stdout);
    log_callback(tex)
    console.log("Done", stdout, stderr);
  })*/

  let worker = new Worker('./Customizing/global/plugins/Modules/TestQuestionPool/Questions/assCodeQuestion/js/javaWorker.js');
  worker.addEventListener('message', function (e) {
    const data = e.data
    console.log(data)
    let tex = '';
    if (data.stderr && data.stderr != '') tex += format_error(data.stderr) + "\n";
    if (data.stdout && data.stdout != '') tex += format_info(data.stdout);
    log_callback(tex)
    console.log("Done", data.stdout, data.stderr);
  }, false);

  worker.postMessage({ cmd: 'run', code: code, className: className, max_ms: max_ms })
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