<template>
    <div>
        <codemirror ref="codeBox" :value="code" :options="options" :class="boxClass" @ready="onCodeReady"
        @focus="onCodeFocus" @input="onCodeChange" :name="`block[${block.parentID}][${block.id}]`">
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
    import '../lib/glsl/glsl'

    //plugins
    import 'codemirror/addon/edit/closebrackets.js'

    //helper to create tooltips at runtime
    import Vue from 'vue'
    import ErrorTip from './ErrorTip.vue'
    const ErrorTipCtor = Vue.extend(ErrorTip)

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
                    if (b.content === undefined) return false;
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
                let allMarks = this.codemirror.getDoc().getAllMarks();
                //console.log("marks", this.block.type, allMarks)
                allMarks.forEach(e => e.clear())                

                this.codemirror.getDoc().clearGutter('diagnostics');                
            },
            onCodeReady(editor) {
                this.updateDiagnosticDisplay();
            },
            onCodeFocus(editor) {

            },
            onCodeChange(newCode) {
                this.block.content = newCode
                if (this.editMode) this.$emit("code-changed-in-edit-mode", undefined);
            },
            updateHeight(){
                if (this.visibleLines === 'auto') {
                    this.codemirror.setSize('height', 'auto');
                } else {
                    this.codemirror.setSize(null, Math.round(20 * Math.max(1, this.visibleLines)) + 9);
                }
            },
            updateDiagnosticDisplay(){
                const val = this.errors;
                if (val!==undefined){
                    this.clearErrorDisplay();                        
                    
                    const first = this.block.firstLine;
                    val.forEach(error => {
                        if (error.start.column>=0){
                            console.log("squiggle", this.block.type);
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
                        }

                        //read existing gutter marker or create a new one
                        let info = this.codemirror.getDoc().lineInfo(error.start.line-first);
                        let element = info && info.gutterMarkers ? info.gutterMarkers['diagnostics'].$component : null;
                        if (element == null) {
                            console.log("Gutter", this.block.type, error.start.line, error.message, first);
                            element = document.createElement("span");

                            //place the updated element
                            this.codemirror.getDoc().setGutterMarker(error.start.line-first, "diagnostics", element);

                            element.$component = new ErrorTipCtor({
                                propsData: {
                                    errors: [],
                                    severity: error.severity 
                                }
                            }).$mount(element);

                            element = element.$component;
                        }

                        //make sure we use the proper class for the given severity.
                        //We allways choose the maximum severity for each marking
                        element.severity = Math.max(error.severity, element.severity); 

                        //Build the hint text
                        if (element.errors.indexOf(error)==-1){
                            element.errors.push(error);
                        }                       
                    });
                } else {
                    this.clearErrorDisplay();
                }            
            }
        },
        computed: {
            errors() {
                return this.block.errors;
            },
            boxClass() {
                let cl = "";
                if (this.block.hidden && !this.editMode) cl += "hiddenBox "
                if (this.block.readonly) cl += "readonlyBox "
                if (this.block.static) cl += "staticBox "                
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
                this.updateDiagnosticDisplay();
            }
        },
        mounted() {
            this.updateHeight();

            const buildIt = function(){
                if (this.editMode) {
                    this.$emit("build");
                }
            }.bind(this);

            this.codemirror.addKeyMap({
                "Cmd-B": function(cMirror) { buildIt() },
                 "Ctrl-B": function(cMirror) { buildIt() }
            });    

            this.codemirror.addKeyMap({
                "Tab": function(cMirror) {
                    cMirror.execCommand("insertSoftTab");              
                }
            });            
        }
    }
</script>

<style scoped lang="sass">
    .hiddenBox 
        display: none !important
    .staticBox 
        opacity: 0.8 
        filter: grayscale(20%)
</style>