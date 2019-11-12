<template>
    <codemirror ref="codeBox" :value="code" :options="options" @ready="onCodeReady" @focus="onCodeFocus"
        @input="onCodeChange">
    </codemirror>
</template>

<script>
    import codemirror from 'vue-codemirror'
    import 'codemirror/lib/codemirror.css'
    import 'codemirror/theme/solarized.css'
    import 'codemirror/theme/xq-light.css'
    import 'codemirror/theme/base16-dark.css'

    export default {
        name: 'CodeBlock',
        props: {
            'theme':{
                type: String,
                default: 'base16-dark'
            }, 
            'language':{
                type: String,
                default: 'text/javascript'
            },
            'block':{
                required: true,
                type: Object,
                validator: function (b) {
                    if (b.content === undefined || !b.hasCode) return false;
                    if (b.firstLine === undefined) return false;
                    return true;
                }
            }
        },        
        methods: {
            onCodeReady(editor) {
                
            },
            onCodeFocus(editor) {
                
            },
            onCodeChange(newCode) {
                this.block.content = newCode
            }
        },
        computed: {
            code() {
                return this.block.content;
            },
            options(){
                return {
                    // codemirror options
                    mode: this.language,
                    theme: this.theme,
                    lineNumbers: true,
                    line: true, 
                    tabSize: 4,
                    indentUnit: 4,
                    autoCloseBrackets: true,
                    firstLineNumber: this.block.firstLine,
                    gutters: ["diagnostics", "CodeMirror-linenumbers"]                   
                }
            },
            codemirror() {
                return this.$refs.codeBox.codemirror
            }
        },
        mounted() {                       
        }
    }
</script>

<style>

</style>