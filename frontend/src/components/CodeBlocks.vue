<template>
    <div :class="`codeblocks ${addonClass}  ${backgroundColorClass} q-mx-sm q-mb-md`">  
        <CodeBlocksSettings 
            v-if="editMode" 
            :options="options" 
            @compiler-change="onCompilerChange"
            @compiler-version-change="onCompilerVersionChange" 
            @run-state-change="onRunStateChange"
            @language-change="onLanguageChange" 
            @character-limit-change="onCharacterLimitChange"
            @timeout-change="onTimeoutChange" 
            @worker-libs-change="onWorkerLibChange"
            @dom-libs-change="onDomLibChange" 
            @theme-change="onThemeChange" 
            @output-parser-change="onOutputParserChange" 
        />
        <CodeBlockContainer 
            :block="block" 
            :editMode="editMode"              
            v-for="block in blocks" 
            :key="block.id"
            @type-change="onTypeChange"
            @visible-lines-change="onVisibleLinesChange"
            @placement-change="onPlacementChange"
            @script-version-change="onScriptVersionChange"
            @move-up="moveUp"
            @move-down="moveDown"
            @remove-block="removeBlock"
            @mounted="didMountChild">              
            
                <CodeBlock 
                    v-if="block.hasCode" 
                    :block="block" 
                    :theme="themeForBlock(block)" 
                    :mode="mimeType"
                    :visibleLines="block.visibleLines" 
                    :editMode="editMode" 
                    :readonly="readonly"
                    @build="run" />

                <CodePlayground 
                    v-else-if="block.type=='PLAYGROUND'" 
                    :block="block" 
                    :editMode="editMode" 
                    :finalOutputObject="finalOutputObject" 
                    :theme="themeForBlock(block)" 
                    @changeOutput="onPlaygroundChangedOutput" 
                    :eventHub="eventHub" />

                <SimpleText 
                    v-else-if="block.type=='TEXT'" 
                    v-model="block.content" 
                    :editMode="editMode"
                    :name="`block[${block.parentID}][${block.id}]`"
                    :language="language" />
        </CodeBlockContainer>

        <div class="row justify-end" v-if="editMode">
            <div >
                <q-btn @click="addNewBlock" push color="green">Add new Block <q-icon name="library_add" class="q-ml-sm"/></q-btn>
            </div>
        </div>
        
        <div :class="`runner ${editMode?'q-pt-lg q-mx-lg':''}`" v-if="canRun">
            <div class="row runnerState">
                <q-btn :loading="!isReady" :disabled="!isReady" color="primary" class="white--text" @click="run" :ripple="{ center: true }" style="border-radius:0px" >
                    Run
                    <q-icon right dark name="play_arrow"></q-icon>
                </q-btn>
                
                <transition
                    appear
                    enter-active-class="animated fadeIn"
                    leave-active-class="animated fadeOut"
                >
                    <div class="globalState col-grow" style="align-self: center;" v-show="showGlobalMessages"><div id="message" v-html="$compilerState.globalStateMessage"> </div></div>        
                </transition>  
            </div>
            <q-slide-transition>
                <pre ref="output" class="output" v-if="hasOutput" v-html="outputHTML"></pre>
            </q-slide-transition>
        </div>
    </div>
</template>

<script>
    import Vue from 'vue'
    import CodeBlockContainer from './CodeBlockContainer';
    import CodeBlocksSettings from './CodeBlocksSettings';
    import CodeBlock from './CodeBlock';
    import CodePlayground from './CodePlayground';
    import SimpleText from './SimpleText';

    export default {
        name: 'CodeBlocks',
        components: {
            CodeBlockContainer,
            CodeBlocksSettings,
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
                finalOutputObject:{ output:"", sansoutput:"", parseError:undefined },
                eventHub:new Vue()
            }
        },
        props: {
            'blockInfo':{ type:Object, required:true}
        },
        computed: {
            options(){
                return {
                    language:this.language,
                    compiler:this.compiler,
                    executionTimeout:this.executionTimeout,
                    maxCharacters:this.maxCharacters,
                    runCode:this.runCode,
                    domLibs:this.domLibraries,
                    workerLibs:this.workerLibraries,
                    id:this.blockInfo.id,
                    codeTheme:this.codeTheme,
                    solutionTheme:this.solutionTheme,
                    outputParser:this.outputParser
                }
            },
            blocks() { return this.blockInfo.blocks },
            language() { return this.blockInfo.language},
            blockid() { return this.blockInfo.id},
            executionTimeout() { return this.blockInfo.executionTimeout},
            maxCharacters() { return this.blockInfo.maxCharacters},
            compiler() { return this.blockInfo.compiler},
            runCode() { return this.blockInfo.runCode},
            domLibraries() { return this.blockInfo.domLibs},
            workerLibraries() { return this.blockInfo.workerLibs},
            solutionTheme() { return this.blockInfo.solutionTheme},
            codeTheme() { return this.blockInfo.codeTheme},
            readonly() { return this.blockInfo.readonly},
            outputParser() { return this.blockInfo.outputParser},
            
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
                return cmp.canRun && this.runCode;
            },
            completeSource() {
                return this.blocks.filter(b => b.hasCode).map(b => b.content).reduce((p, c) => p + "\n" + c, "");                      
            },
            showGlobalMessages() {
                return !this.$compilerState.globalStateHidden;
            },
            playgrounds() {
                return this.blocks.filter(b => b.type=='PLAYGROUND');
            },
            outputElement(){
                return this.$refs.output;           
            },
            addonClass() {
                let cl = "";
                if (this.editMode) cl += "editmode ";
                if (this.readonly) cl += "block-readonly ";
                return cl;
            },
            backgroundColorClass(){
                return this.editMode?'blue-grey darken-4':''
            }
        },
        methods: {
            didMountChild(){
                let mountCount = this.blockInfo.blocks.map(b => b.mountCount).reduce((p,c) => p+c, 0);
                console.log("mounted Blocks", mountCount)
                if (mountCount == this.blockInfo.blocks.length){
                    this.$nextTick(()=>{
                        this.eventHub.$emit('all-mounted', {  })
                    })
                }
            },
            themeForBlock(bl){
                if (bl.static || bl.readonly || bl.hidden) {
                    return this.blockInfo.codeTheme;
                } 
                        
                return this.blockInfo.solutionTheme;    
            },
            blockById(id){
                return this.blocks.find( block => block.id == id);
            },
            onTypeChange(nfo){},
            onVisibleLinesChange(nfo){},
            onPlacementChange(nfo){},
            onScriptVersionChange(nfo){},
            onCompilerChange(v){},
            onCompilerVersionChange(v){},
            onRunStateChange(v){},
            onLanguageChange(v){},
            onCharacterLimitChange(v){},
            onTimeoutChange(v){},
            onWorkerLibChange(v){},
            onDomLibChange(v){},
            onThemeChange(nfo){},
            onOutputParserChange(v){},
            moveUp(idx){},
            moveDown(idx){},
            removeBlock(idx){},
            addNewBlock(){},
            onPlaygroundChangedOutput(newOutput){
                if (newOutput===undefined) return;
                if (this.output != newOutput) {
                    this.output = newOutput.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
                    if (this.maxCharacters>0 && this.output.length > this.maxCharacters) {
                        this.outputHTML = this.output.substr(0, this.maxCharacters);
                        this.outputHTML += this.$CodeBlock.format_info('Info: Output too long. Removed all following Characters. \n<b>...</b>\n\n');                        
                    } else {
                        this.outputHTML = this.output;
                    }
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
                this.eventHub.$emit('render-diagnostics', {  })                            
            }, 
            
            
            loadLibraries(whenLoaded){
                this.$compilerRegistry.loadLibraries(this.domLibraries, whenLoaded);                
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
                        processed = this.$CodeBlock.processMixedOutput(output, this.outputParser);
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
                this.loadLibraries(function(){
                    this.eventHub.$emit('before-run', {  })
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
                    }.bind(this)
                )
            }
        },
        mounted() {
            let cmp = this.$compilerRegistry.getCompiler(this.compiler);
            if (cmp) {
                cmp.preload();
            }
            this.loadLibraries(function(){
                    this.eventHub.$emit('initialized-libraries', {  })
            }.bind(this));
            this.didInitialize = true;
        }
    }
</script>

<style lang="sass">   
    div.codeblocks.editmode
        box-shadow: 3px 3px 6px rgba(0,0,0,0.1)
        border-radius: 5px        
        background-repeat: repeat
        background-image: linear-gradient(45deg, #ffffff 25%, #ebf2f5 25%, #ebf2f5 50%, #ffffff 50%, #ffffff 75%, #ebf2f5 75%, #ebf2f5 100%)
        background-size: 56.57px 56.57px
        
    div.codeblocks  
        height: fit-content
        margin: 4px
        padding: 8px        
        .block
            padding: 0px
            margin: 0px
    div.runner
        margin: 8px 0px !important
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