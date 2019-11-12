<template>
<div>
    <codemirror ref="codeBox" :value="code" :options="options" :class="boxClass" @ready="onCodeReady"
        @focus="onCodeFocus" @input="onCodeChange">
    </codemirror>
    </div>
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

    let nextErrorID = 1;

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
            clearErrorDisplay(){
                this.codemirror.getDoc().clearGutter('diagnostics');
                let allMarks = this.codemirror.getDoc().getAllMarks();
                allMarks.forEach(e => e.clear())
                
            },
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
            errors() {
                return this.block.errors;
            },
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
                this.updateHeight();
            },
            errors: function(val){
                if (val!==undefined){
                    //clear Gutter if list goes back to 0-elements
                    //we do not handle a case where an error is removed!!!
                    if (val.length==0) this.clearErrorDisplay();
                
                    const first = this.block.firstLine;
                    val.forEach(error => {
                        //put a squigly line as code marker 
                        this.codemirror.getDoc().markText(
                            {line:error.start.line-first, ch:error.start.column}, 
                            {line:error.end.line-first, ch:error.end.column}, 
                            {
                                className:'red-wave',
                                inclusiveLeft:true,
                                inclusiveRight:true,
                                title:error.message                
                            }
                        );

                        //read existing gutter marker or create a new one
                        let info = this.codemirror.getDoc().lineInfo(error.start.line-first);
                        let element = info.gutterMarkers ? info.gutterMarkers['diagnostics'] : null;
                        if (element == null) {
                            element = document.createElement("span");
                            element.severity = error.severity;
                            element.errors = [];
                        }

                        //make sure we use the proper class for the given severity.
                        //We allways choose the maximum severity for each marking
                        let gutterSeverity = Math.max(error.severity, element.severity); 
                        let gutterClassName = '';
                        switch (gutterSeverity) {
                            case this.SEVERITY_ERROR:
                                gutterClassName = "code-error gutter-error";
                                break;
                            case this.SEVERITY_WARNING:
                                gutterClassName = "code-warning gutter-warning";
                                break;
                            default:
                                console.error("Unknown Severity", gutterSeverity[line]);
                                return;
                        }
                        element.className = "mdi mdi-" + gutterClassName;

                        //Build the hint text
                        if (element.errors.indexOf(error)==-1){
                            var title = element.title;
                            title = title!='' ? (title + "\n\n" + '- ' + error.message) : ('- ' +error.message);
                            element.title = title;  
                            element.errors.push(error);
                        }

                        //place the updated element
                        this.codemirror.getDoc().setGutterMarker(error.start.line-first, "diagnostics", element)
                    });
                } else {
                    this.clearErrorDisplay();
                }
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