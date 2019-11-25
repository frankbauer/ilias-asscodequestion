<template>
    <div :class="`codeblocks ${addonClass}`">        
        <div class="block" v-for="block in blocks" :key="block.id">
            <CodeBlock v-if="block.hasCode" :block="block" :theme="block.editorTheme" :mode="mimeType"
                :visibleLines="block.visibleLines" :editMode="editMode" @build="run"></CodeBlock>
            <CodePlayground v-if="block.type=='PLAYGROUND'" :block="block" :editMode="editMode" :finalOutputObject="finalOutputObject" @changeOutput="onPlaygroundChangedOutput"></CodePlayground>
            <SimpleText v-if="block.type=='TEXT'" v-model="block.content" :editMode="editMode" ></SimpleText>
        </div>
        <div class="runner" v-if="canRun">
            <div class="d-flex pa-2 runnerState">
                <v-btn :loading="!isReady" :disabled="!isReady" color="primary" class="white--text flex-grow-0" tile small
                    @click="run">
                    Run
                    <v-icon right dark>mdi-play-button</v-icon>
                </v-btn>
                
                <v-fade-transition>
                    <div class="globalState flex-grow-1 align-self-center" v-html="$compilerState.globalStateMessage" v-show="showGlobalMessages"></div>        
                </v-fade-transition>  
            </div>
            <v-expand-transition>
                <pre ref="output" class="output" v-if="hasOutput" v-html="outputHTML"></pre>
            </v-expand-transition>
        </div>
    </div>
</template>

<script>
    import CodeBlock from '../components/CodeBlock';
    import CodePlayground from '../components/CodePlayground';
    import SimpleText from '../components/SimpleText';

    export default {
        name: 'CodeBlocks',
        components: {
            CodeBlock,
            CodePlayground,
            SimpleText
        },
        data:function(){
            return {
                didInitialize: false,
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
                default: 5000
            },
            'maxCharacters': {
                type: Number,
                default: 1000
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
            editMode() {
                return false;
            },
            hasOutput(){
                return this.outputHTML!==undefined && this.outputHTML!=""
            },
            mimeType() {
                return this.$CodeBlock.mimeType(this.language);
            },
            isReady() {
                let cmp = this.$compilerRegistry.getCompiler(this.compiler);
                if (!cmp) return false;

                return this.didInitialize && cmp.isReady && !cmp.isRunning && !this.$compilerState.runButtonForceHide;
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
            },
            addonClass() {
                let cl = "";
                if (this.editMode) cl += "editmode ";
                return cl;
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
                        processed = this.$CodeBlock.processMixedOutput(this.output, true);
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
                    this,
                    this.executionTimeout,
                    this.log.bind(this),
                    this.logInfo.bind(this),
                    this.logError.bind(this),
                    this.processDiagnostics.bind(this),
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
        mounted() {
            let cmp = this.$compilerRegistry.getCompiler(this.compiler);
            if (cmp) {
                cmp.preload();
            }
            this.didInitialize = true;
        }
    }
</script>

<style lang="sass">   
    div.codeblocks.editmode
        border: 1px dashed silver
        border-radius: 5px        
        background-color: white 
    div.codeblocks            
        margin: 4px
        padding: 8px        
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