<template>
    <div>
        {{originalMode}}
        <PlaygroundCanvas ref="playgroundContainer" :output="finalOutputObject.initialOutput" :obj="block.obj" :key="runCount" @canvas-change="onCanvasChange" />
        <codemirror ref="codeBox" :value="block.content"  :options="options" v-if="editMode" class="playgroundedit py-3"></codemirror>
    </div>
</template>

<script>
import codemirror from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'

//helper to reset the canvas area if needed
import Vue from 'vue'
import PlaygroundCanvas from './PlaygroundCanvas'
const PlaygroundCanvasCtor = Vue.extend(PlaygroundCanvas)

export default {
    name:"codePlayground",
    components:{PlaygroundCanvas},
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
    },
    beforeDestroy() {
        this.eventHub.$off('before-run', this.resetBeforeRun)
    },
    data:function(){
        return {
            isPreparingRun:false,
            lastRun:0,
            runCount:0,
            canvas:undefined
        }
    },
    methods:{
        resetBeforeRun(){
            if (this.block && this.block.obj){
                if (this.block.obj.shouldAutoReset()) {
                    //console.log("Will Re-Initiualize", this.canvas, $(this.canvas).css('background-color'));                           
                    this.lastRun = new Date()
                    this.runCount++;                                   
                } else {
                   this.$nextTick(function () {
                        //console.log("Will Reset", this.canvas, $(this.canvas).css('background-color'));   
                        this.block.obj.reset($(this.canvas));
                    }.bind(this))  
                }
            }
        },
        onCanvasChange(can){
            this.canvas = can
            //console.log("Changed Canvas", can, $(can).css('background-color'));    
        }
    },
    watch:{        
        finalOutputObject: function (val) {            
            const initialOutput = val.output;

            if (this.block.obj){
                this.block.obj.err = [];
                try {
                    if (val.parseError!=null && typeof calls !== 'undefined'){
                        block.obj.onParseError(initialOutput, val.parseError)                    
                    }

                    this.$nextTick(function () {
                        //console.log("Will Update", this.canvas, $(this.canvas).css('background-color'));
                                        
                        const result = this.block.obj.update(val, $(this.canvas));       
                        if (result !== undefined){
                            this.$emit('changeOutput', result);
                        }
                    }.bind(this))    
                } catch (e) {
                    console.error(e);
                }
                if (this.block.obj.err.length > 0){
                    if (this.editMode){
                        //do some error handling
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

.playground 
    display: block
    width:100%
    height:200px
    border:1px dashed rgb(128, 48, 48, 0.66)
    border-radius: 3px
    background-color:rgba(255, 255, 255, 0.63766)
    margin-top:4px
    margin-bottom:4px
    transition: opacity 600ms, visibility 600ms

</style>