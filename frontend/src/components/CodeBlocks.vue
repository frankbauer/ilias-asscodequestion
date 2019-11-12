<template>
    <div class="codeblocks">
        {{language}}
        <div class="block" v-for="block in blocks" :key="block.id">
            <CodeBlock v-if="block.hasCode" :block="block" :theme="block.editorTheme" :mode="mimeType"
                :visibleLines="block.visibleLines" :editMode="editMode"></CodeBlock>
        </div>
        <div class="runner" v-if="canRun">
            <div class="d-flex pa-2 runnerState">
                <v-btn :loading="!isReady" :disabled="!isReady" color="primary" class="white--text flex-grow-0" tile small
                    @click="run">
                    Run
                    <v-icon right dark>mdi-play</v-icon>
                </v-btn>
                <div class="globalState flex-grow-1 align-self-center" v-html="$compilerState.globalStateMessage" v-if="showGlobalMessages"></div>                
            </div>

            <pre class="output" v-if="hasOutput" v-html="outputHTML"></pre>
        </div>

            <span class="mdi mdi-warning"></span>
    </div>
</template>

<script>
    import CodeBlock from '../components/CodeBlock';

    /**
     * This object defines the programming languages supported for code highlighting
     * using CodeMirror
     * @namespace cmMode The programminglanguages supported
     */
    const mimeTypesForLanguage = {
        'c': 'text/x-csrc', // (C),
        'c++': 'text/x-c++src', // (C++),
        'c#': 'text/x-csharp', // (C#),
        'css': 'text/css', // (CSS)
        'fortran': 'text/x-fortran', // (Fortran)
        'glsl': 'text/x-glsl', // (GLSL)
        'html': 'text/html', // (HTML)
        'java': 'text/x-java', // (Java),
        'java2': 'text/x-java', // (Java),
        'javascript': 'text/javascript', // (JavaScript)
        'objectivec': 'text/x-objectivec', // (Objective-C),
        'perl': 'text/x-perl', // (Perl)
        'php': 'application/x-httpd-php', // (PHP)
        'python': 'text/x-python', // (Python)
        'r': 'text/x-rsrc', //(R)
        'ruby': 'text/x-ruby', // (Ruby)
        'sql': 'text/x-mysql', // (mysql)
        'xml': 'application/xml' //text/html (XML)
    };


    export default {
        name: 'CodeBlocks',
        components: {
            CodeBlock
        },
        data:function(){
            return {
                outputHTML:"",
                output:"",
                sansoutput:"",
                didClip:false,
            }
        },
        props: {
            'blocks': Array,
            'language': String,
            'blockid': Number,
            'executionTimeout': {
                type: Number,
                default: 3000
            },
            'maxCharacters': {
                type: Number,
                default: 100
            },
            'editMode': {
                type: Boolean,
                default: false
            },
            'compiler': {
                type: Object,
                default: {
                    languageType: 'none',
                    version: '1'
                }
            }
        },
        computed: {
            hasOutput(){
                return this.outputHTML!==undefined && this.outputHTML!=""
            },
            mimeType() {
                return mimeTypesForLanguage[this.language];
            },
            isReady() {
                let cmp = this.$compilerRegistry.getCompiler(this.compiler);
                if (!cmp) return false;

                return cmp.isReady && !cmp.isRunning && !this.$compilerState.runButtonForceHide;
            },
            canRun() {
                let cmp = this.$compilerRegistry.getCompiler(this.compiler);
                if (!cmp) return false;
                return cmp.canRun;
            },
            completeSource() {
                return this.blocks.filter(b => b.hasCode).map(b => b.content).reduce((p, c) => p + "\n" + c, "");
            },
            showGlobalMessages() {
                return !this.$compilerState.globalStateHidden;
            }
        },
        methods: {
            resetOutput(){
                this.output = '';
                this.sansoutput = '';
                this.didClip = false;
                this.outputHTML = '';
            },
            log(text){
                //console.log("log", text);
                this.output += text;
                text = text.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
                if (!this.didClip) {
                    if (this.maxCharacters>0 && this.output.length > this.maxCharacters) {
                        this.outputHTML += this.$CodeBlock.format_info('Info: Output too long. Removed all following Characters. \n<b>...</b>\n\n');
                        this.didClip = true;
                    } else {
                        this.outputHTML += text;
                    }
                }
            },
            logError(text){
                text = text.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
                text = this.$CodeBlock.format_error(text);
                //console.log("err", text);
                this.sansoutput += text; 
                this.outputHTML += text; 
            },
            logInfo(text){
                text = text.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
                text = this.$CodeBlock.format_info(text);
                //console.log("nfo", text);
                this.sansoutput += text; 
                this.outputHTML += text;  
            },
            processDiagnostics(error) {
                const line = error.start.line;
                this.blocks.forEach( block => {
                    if (!block.hasCode) return;                    
                    
                    const first = block.firstLine;
                    const last = block.nextLine - 1;
                    
                    if (error.start.line+1 >= first && error.start.line+1 <= last) {
                        block.errors.push(error);                        
                    }
                });
            },
            clearDiagnostics(){
                this.blocks.forEach( block => block.errors = []);                
            },
            run() {
                let cmp = this.$compilerRegistry.getCompiler(this.compiler);
                if (!cmp) return false;

                this.resetOutput();
                this.clearDiagnostics();
                cmp.compileAndRun(
                    this.blocks.id,
                    this.completeSource,
                    null,
                    this.executionTimeout,
                    this.log.bind(this),
                    this.logInfo.bind(this),
                    this.logError.bind(this),
                    function (error) {
                        this.processDiagnostics(error);
                    }.bind(this),
                    function (success = true, overrideOutput = undefined) {
                        if (!success) {
                            this.$compilerState.hideGlobalState();
                            this.$compilerState.setAllRunButtons(true);
                            return undefined;
                        }
                        //var res = finishedExecution(overrideOutput?overrideOutput:output, sansoutput, questionID, outdiv);
                        this.$compilerState.hideGlobalState();
                        this.$compilerState.setAllRunButtons(true);
                        //return res;
                    }.bind(this)
                )
            }
        },
        created() {
            let cmp = this.$compilerRegistry.getCompiler(this.compiler);
            if (cmp) {
                cmp.preload();
            }
        }
    }
</script>

<style scoped lang="sass">
    div .codeblocks        
        border: 1px dashed silver
        border-radius: 5px
        margin: 4px
        padding: 8px
        background-color: white
        .block
            padding: 0px
            margin: 0px
    div.runner
        margin: 8px 0px !important
        padding: 0px !important
        .runnerState
            margin: 0px !important
            padding: 0px !important
            button
                margin: 0px!important            
            .globalState
                margin-left: 10px
                color: gray
                padding-left: 4px
                padding-right: 4px
                vertical-align: middle
        .output
            display: block
            font-family: monospace
            border: 1px solid #ccc
            border-radius: 0px
            background-color: #f5f5f5
            margin: 0 0 10px
            padding: 9.5px
            line-height: 1.42857143
            color: #333333
            word-break: break-all
            word-wrap: break-word
</style>