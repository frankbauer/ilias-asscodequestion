<template>
    <codemirror ref="codeBox" :value="code" :options="options" :class="boxClass" @ready="onCodeReady"
        @focus="onCodeFocus" @input="onCodeChange">
    </codemirror>
</template>

<script>
    import codemirror from 'vue-codemirror'
    import 'codemirror/lib/codemirror.css'

    //themes
    import 'codemirror/theme/solarized.css'
    import 'codemirror/theme/base16-dark.css'
    import 'codemirror/theme/base16-light.css'
    import 'codemirror/theme/duotone-dark.css'
    import 'codemirror/theme/duotone-light.css'
    import 'codemirror/theme/xq-dark.css'
    import 'codemirror/theme/xq-light.css'
    import 'codemirror/theme/blackboard.css'
    import 'codemirror/theme/midnight.css'
    import 'codemirror/theme/neo.css'
    import 'codemirror/theme/mbo.css'
    import 'codemirror/theme/mdn-like.css'

    //languages
    import 'codemirror/mode/clike/clike.js'
    import 'codemirror/mode/fortran/fortran.js'
    import 'codemirror/mode/javascript/javascript.js'
    import 'codemirror/mode/perl/perl.js'
    import 'codemirror/mode/python/python.js'
    import 'codemirror/mode/r/r.js'
    import 'codemirror/mode/ruby/ruby.js'
    //import 'codemirror/mode/glsl/glsl.js'

    //plugins
    import 'codemirror/addon/edit/closebrackets.js'

    export default {
        name: 'CodeBlock',
        props: {
            'visibleLines': {
                type: String,
                default: 'auto'
            },
            'theme': {
                type: String,
                default: 'base16-dark'
            },
            'mode': {
                type: String,
                default: 'text/javascript'
            },
            'block': {
                required: true,
                type: Object,
                validator: function (b) {
                    if (b.content === undefined || !b.hasCode) return false;
                    if (b.firstLine === undefined) return false;
                    return true;
                }
            },
            'editMode': {
                type: Boolean,
                default: false
            }
        },
        methods: {
            onCodeReady(editor) {

            },
            onCodeFocus(editor) {

            },
            onCodeChange(newCode) {
                this.block.content = newCode
            },
            updateHeight(){
                if (this.visibleLines === 'auto') {
                    this.codemirror.setSize('height', 'auto');
                } else {
                    this.codemirror.setSize(null, Math.round(20 * Math.max(1, this.visibleLines)) + 9);
                }
            }
        },
        computed: {
            boxClass() {
                let cl = "";
                if (this.hidden) cl += "hiddenBox "
                if (this.readonly) cl += "readonlyBox "
                if (this.static) cl += "staticBox "
                return cl;
            },
            code() {
                return this.block.content;
            },
            options() {
                return {
                    // codemirror options
                    mode: this.mode,
                    theme: this.theme,
                    lineNumbers: true,
                    line: true,
                    tabSize: 4,
                    indentUnit: 4,
                    autoCloseBrackets: true,
                    readOnly: !this.editMode && (this.block.readonly || this.block.static || this.block.hidden),
                    firstLineNumber: this.block.firstLine,
                    gutters: ["diagnostics", "CodeMirror-linenumbers"]
                }
            },
            codemirror() {
                return this.$refs.codeBox.codemirror
            }
        },
        watch: {
            visibleLines: function (val) {
                console.log(this.visibleLines, val)
                this.updateHeight();
            }
        },
        mounted() {
            this.updateHeight();
        }
    }
</script>

<style lang="sass" scoped>
    .hiddenBox 
        display:none 
    .staticBox 
        opacity: 0.8 
        filter: grayscale(20%)
</style>