<template>
    <div>
        <PlaygroundCanvas ref="playgroundContainer" 
            :output="finalOutputObject.initialOutput" 
            :obj="block.obj" 
            :key="runCount" 
            :block="block" 
            @canvas-change="onCanvasChange" 
            @did-init="onDidInit"
        />
        <CodeBlock 
            v-if="editMode" 
            :block="block" 
            :theme="options.theme" 
            :mode="options.mode"
            visibleLines="auto" 
            :editMode="this.editMode" 
            @code-changed-in-edit-mode="onCodeChange"
        />
    </div>
</template>

<script>
import codemirror from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'

//helper to reset the canvas area if needed
import Vue from 'vue'
import PlaygroundCanvas from './PlaygroundCanvas'
const PlaygroundCanvasCtor = Vue.extend(PlaygroundCanvas)

import CodeBlock from './CodeBlock'
export default {
    name:"codePlayground",
    components:{PlaygroundCanvas, CodeBlock},
    props:{
        finalOutputObject:{
            type:Object,
            required: true
        },
        'block': {
            required: true,
            type: Object,
            validator: function (b) {
                if (!b.obj) return false;                
                return true;
            }
        },
        'editMode': {
            type: Boolean,
            default: false
        },
        'visibleLines': {
                type: String,
                default: 'auto'
        },
        'theme': {
            type: String,
            default: 'base16-dark'
        },
        'eventHub': {
            type: Object,
            required: true            
        }
    },
    computed:{
        originalMode(){
            return this.block.obj.requestsOriginalVersion();
        },        
        options(){
            return {
                    // codemirror options
                    mode: this.$CodeBlock.mimeType('javascript'),
                    theme: this.theme,
                    lineNumbers: true,
                    line: true,
                    tabSize: 4,
                    indentUnit: 4,
                    autoCloseBrackets: true,
                    readOnly: !this.editMode,
                    firstLineNumber: 1,
                    gutters: ["diagnostics", "CodeMirror-linenumbers"]
                }
        }
    },
    created(){
        this.eventHub.$on('before-run', this.resetBeforeRun)        
        this.eventHub.$on('render-diagnostics', this.updateErrors)        
    },
    mounted(){
        const hasErrors = this.block && this.block.obj && this.block.obj.err.length > 0  ;
        if (hasErrors) this.updateErrors();  
    },
    beforeDestroy() {
        this.eventHub.$off('before-run', this.resetBeforeRun) 
        this.eventHub.$off('render-diagnostics', this.updateErrors) 
    },
    data:function(){
        return {
            isPreparingRun:false,
            lastRun:0,
            runCount:0,
            canvas:undefined,
            needsCodeRebuild:false,
            initAndRebuildErrors:[]           
        }
    },
    methods:{
        updateErrors(){
            this.block.errors = [];
            
            this.block.obj.err = this.block.obj.err.concat(this.initAndRebuildErrors)
            this.block.obj.err.forEach(e => {
                let err = {
                    start : { line: e.line, column:e.column},
                    end : { line: e.line, column:e.column+1},
                    message: e.msg,
                    severity: Vue.$SEVERITY_ERROR
                };
                if (e.line===undefined){
                    err.start = {line:1, column:-1}
                    err.end = {line:1, column:-1}
                } else if (e.column===undefined){
                    err.start = {line:e.line, column:-1}
                    err.end = {line:e.line, column:-1}
                }
                this.block.errors.push(err); 
            })
            

            if (this.block.obj.err.length > 0 && this.editMode) {
                this.needsCodeRebuild = true;
                return true;
            } else {
                return false;
            }
        },
        resetBeforeRun(){
            if (this.editMode && this.needsCodeRebuild){
                this.initAndRebuildErrors = [];

                //console.log("Code", this.block.content);
                this.block.obj.rebuild(this.block.content);                
                if (this.updateErrors()) {
                    this.initAndRebuildErrors = this.block.obj.err;
                    return;
                }

                this.block.obj.init($(this.canvas));                
                if (this.updateErrors()) {
                    this.initAndRebuildErrors = this.block.obj.err;
                    return;
                }
            }
            if (this.block && this.block.obj){
                if (this.block && this.block.obj && this.block.obj.shouldAutoReset()) {
                    //console.log("Will Re-Initialize", this.canvas, $(this.canvas).css('background-color'));                           
                    this.lastRun = new Date()
                    this.runCount++;                                   
                } else {
                   this.$nextTick(function () {
                        //console.log("Will Reset", this.canvas, $(this.canvas).css('background-color'));   
                        this.block.obj.reset($(this.canvas));
                        this.updateErrors();
                    }.bind(this))  
                }
                this.updateErrors();
            }
        },
        onCanvasChange(can){
            this.canvas = can
            if (this.editMode) this.updateErrors();
            //console.log("Changed Canvas", can, $(can).css('background-color'));    
        },
        onCodeChange(newCode){
            if (this.editMode){
                this.needsCodeRebuild = true;
            }
        },
        onDidInit(){
            this.updateErrors();
        }
    },
    watch:{        
        finalOutputObject: function (val) {                    
            const initialOutput = val.output;

            if (this.block.obj){                
                this.block.obj.err = [];
                try {
                    if (val.parseError!=null){
                        if (!this.block.obj.onParseError(initialOutput, val.parseError) && this.editMode){
                            let jStr = initialOutput;
                            if (val.parseError.parsedString){
                                jStr = val.parseError.parsedString;
                            }
                            console.log(val, jStr);

                           this.$q.dialog({
                                title: 'Output is not a valid JSON-Object',
                                message: '<span class="text-caption jsonErrTitle">Output:</span><div class="jsonErrObj">' + jStr + '</div>\n<span class="text-caption jsonErrTitle">Message:</span><div class="jsonErr">' + val.parseError + '</div>',
                                html: true
                            }).onOk(() => {
                                // console.log('OK')
                            }).onCancel(() => {
                                // console.log('Cancel')
                            }).onDismiss(() => {
                                // console.log('I am triggered on both OK and Cancel')
                            }) 
                        }
                        if (this.updateErrors()) return;                   
                    }

                    this.$nextTick(function () {
                        let result = this.block.obj.update(val, $(this.canvas)); 
                        if (this.updateErrors()) return;

                        //construct a split output object
                        if (result === undefined && val.processedOutput.type!='text'){
                            result = val.processedOutput.text
                        }      
                        
                        if (result !== undefined){
                            this.$emit('changeOutput', result);
                        }
                    }.bind(this))    
                } catch (e) {
                    console.error(e);
                }
                if (this.block.obj.err.length > 0){
                    if (this.editMode){
                        this.updateErrors();
                    } else {                        
                        console.error(this.block.obj.err);
                    }
                }
            }

        },
    }
}
</script>

<style lang="sass" scoped>
.playgroundedit
    border-radius: 5px
.hiddenBlock
    display: none !important

.hiddenBlock    
    opacity: 0
    visibility: hidden
</style>
<style lang="stylus">
@import '../styles/quasar.variables.styl'
.jsonErrObj, .jsonErr
    margin-left: 16px
    font-weight: bold
.jsonErrObj
    padding-left: 4px
    padding-right: 4px
    font-family: monospace
    margin-bottom: 20px
    background-color:$amber-2
.jsonErr
    font-weight: bold
    color: $deep-orange-14
.jsonErrTitle
    padding-left: 8px
    text-transform: uppercase
</style>