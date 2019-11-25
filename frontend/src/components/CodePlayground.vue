<template>
    <div>
        <div ref="playgroundContainer" class="playground">{{finalOutputObject.initialOutput}}</div>
        <codemirror ref="codeBox" :value="block.content"  :options="options" v-if="editMode"></codemirror>
    </div>
</template>

<script>
import codemirror from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'

export default {
    components:[codemirror],
    name:"codePlayground",
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
        }
    },
    computed:{
        canvas(){
            return this.$refs.playgroundContainer;           
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
    mounted(){
        if (this.block.obj){
            this.block.obj.init($(this.canvas));
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

                    const result = this.block.obj.update(val, $(this.canvas));       
                    if (result !== undefined){
                        this.$emit('changeOutput', result);
                    }
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