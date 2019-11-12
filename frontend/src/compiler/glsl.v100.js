import Vue from 'vue'

function runGLSLWorker(questionID, prog, callingCodeBlocks, maxRuntime, logCallback, infoCallback, errCallback, compileFailedCallback, finishCallback) {
    var outputData = [];
    callingCodeBlocks.blocks.filter(b => b.hasCode).forEach(block => outputData.push(block.content));
    /*$("[data-contains-code][data-question="+questionID+"]").each(function(i, block) {
        if (block.getAttribute('data-ignore')) return;
        if (!blockHasProgramCode(block)) return;
        const editor = editors[block.id];
        if (editor) {
            outputData.push(block.value);
        } else {
            outputData.push(block.innerHTML);
        }
    });*/
    finishCallback(true, outputData);
}

const singleton = new Vue({
    data: function () {
        return {
            version: "100",
            language: "glsl",    
            canRun: true,
            isReady: true,
            isRunning: false
        }
    },
    methods: {
        preload() {
            
        },
        compileAndRun(questionID, code, callingCodeBlocks, max_ms, log_callback, info_callback, err_callback, compileFailedCallback, finishedExecutionCB, runCreate = true){
            return runGLSLWorker(questionID, code, callingCodeBlocks, max_ms, log_callback, info_callback, err_callback, compileFailedCallback, finishedExecutionCB, runCreate);
        }
    }
})
export default singleton;