function runGLSLWorker(questionID, prog, mypre, maxRuntime, logCallback, infoCallback, errCallback, compileFailedCallback, finishCallback) {
    var outputData = [];
    $("[data-contains-code][data-question="+questionID+"]").each(function(i, block) {
        if (block.getAttribute('data-ignore')) return;
        if (!blockHasProgramCode(block)) return;
        const editor = editors[block.id];
        if (editor) {
            outputData.push(block.value);
        } else {
            outputData.push(block.innerHTML);
        }
    });
    finishCallback(true, outputData);
}

(function () {
    registerLanguage('glsl', runGLSLWorker);
  })();