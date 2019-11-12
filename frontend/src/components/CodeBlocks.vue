<template>
    <div class="codeblocks">
        {{language}}
        <div class="block" v-for="block in blocks" :key="block.id">
            <CodeBlock v-if="block.hasCode" :block="block" :theme="block.editorTheme" :mode="mimeType"
                :visibleLines="block.visibleLines" :editMode="editMode" @build="run"></CodeBlock>
            <CodePlayground v-if="block.type=='PLAYGROUND'" :block="block" :editMode="editMode" :finalOutputObject="finalOutputObject" @changeOutput="onPlaygroundChangedOutput"></CodePlayground>
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

            <pre ref="output" class="output" v-if="hasOutput" v-html="outputHTML"></pre>
        </div>
    </div>
</template>

<script>
    import CodeBlock from '../components/CodeBlock';
    import CodePlayground from '../components/CodePlayground';

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
            CodeBlock,
            CodePlayground
        },
        data:function(){
            return {
                outputHTML:"",
                output:"",
                sansoutput:"",
                didClip:false,
                finalOutputObject:{ output:"", sansoutput:"", parseError:undefined }
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
            },
            playgrounds() {
                return this.blocks.filter(b=> b.type=='PLAYGROUND');
            },
            outputElement(){
                return this.$refs.output;           
            }
        },
        methods: {
            onPlaygroundChangedOutput(newOutput){
                if (newOutput===undefined) return;
                console.log("NewOutput", newOutput)
                if (this.output != newOutput) {
                    this.output = newOutput.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
                    this.outputHTML = this.output;
                    this.outputHTML += this.sansoutput;
                }
            },
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
                    
                    if (error.start.line >= first && error.start.line <= last) {
                        block.errors.push(error);                        
                    }
                });
            },
            clearDiagnostics(){
                this.blocks.forEach( block => block.errors = []);                
            },
            displayResults(
                    outputObject, 
                    canvasElement, 
                    questionID, 
                    blockID, 
                    initialOutput=undefined, 
                    parseError=undefined, 
                    obj=undefined){
                

                if (!canvasElement || canvasElement.length==0 || obj === undefined) return;

                if (parseError!=null && typeof calls !== 'undefined'){
                    obj.onParseError(initialOutput, parseError)                    
                }

                /*canvasElement = $(canvasElement)
                canvasElement.removeClass('hiddenBlock')*/
                if (outputObject===undefined) {            
                    obj.init(canvasElement)
                } else {
                    const result = obj.update(outputObject, canvasElement)
                    if (result!==undefined) outputObject = result
                }
                return outputObject
            },
            /**
             * Seperates an outputObject (like the one you will get in the update-method of a playground handler) into a string and a json object seperated by a magic String. Returns an object that contains 
             *  <code>type</code> = <code>'dual'</code> parsed a magic string, <code>'json'</code> parsed as json, <code>'text'</code> plain text
             *  <code>json</code> = the JSON object that was sent after the magicString
             *  <code>text</code> = the String that was sent before the magicString
             * @param {*} outputObject  The outputObject generated by the student code
             * @param {*} autoJSON  When true, output that starts with [ or { will be parsed as JSON
             * @param {*} magicString The seperating String. By default it is '\n\n<JSON>\n'
             */
            processMixedOutput(outputObject, autoJSON, magicString) {
                if (magicString===undefined) magicString = '\n\n<JSON>\n';
                const idx = outputObject.indexOf(magicString);    
                if (idx >= 0) {
                    const str = outputObject.substr(0, idx);
                    const json = JSON.parse(outputObject.substr(idx+magicString.length)); 
                
                    return {
                        type:'dual',
                        json:json,
                        text:str
                    };
                } else if (outputObject.indexOf('[')!=-1 || outputObject.indexOf('{')!=-1) {
                    return {
                        type:'json',
                        json:JSON.parse(outputObject),
                        text:""
                    };
                }

                return {
                   type:'text',
                   json:undefined,
                   text:outputObject
                };
            },
            /**
             * Call when the program finished executing and pass the output string. We will send the output to all embeded canvas elements
             * @param {*} output 
             * @param {*} infoErrorOutput output generated by info or error messages
             */
            finishedExecution(output, infoErrorOutput){
                let parseError = null
                let processed = {type:'text', json:undefined, text:output}
                
                if (output !== undefined && this.playgrounds.length>0){  
                    try {
                        processed = this.processMixedOutput(this.output, true);
                    } catch (e) {
                        parseError = e;        
                    }
                }

                this.finalOutputObject = {
                    output: output,
                    processedOutput: processed,
                    sansoutput: this.sansoutput,
                    parseError: parseError,
                    outputElement: $(this.outputElement)
                }                                
            },
            run() {
                let cmp = this.$compilerRegistry.getCompiler(this.compiler);
                if (!cmp) return false;

                this.$compilerState.setAllRunButtons(false);
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
                        let res = this.finishedExecution(overrideOutput?overrideOutput:this.output, this.sansoutput);
                        this.$compilerState.hideGlobalState();
                        this.$compilerState.setAllRunButtons(true);
                        return res;
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