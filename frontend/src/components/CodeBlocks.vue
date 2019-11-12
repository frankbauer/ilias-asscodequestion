<template>
    <div class="codeblocks">
        {{language}}
        <div class="block" v-for="block in blocks" :key="block.id">
            <CodeBlock v-if="block.hasCode" :block="block" :theme="block.editorTheme" :mode="mimeType"
                :visibleLines="block.visibleLines" :editMode="editMode"></CodeBlock>
        </div>
        <div class="runner">
            <v-btn :loading="!isReady" :disabled="!isReady" color="blue-grey darken-1" class="ma-2 white--text"
                @click="run" v-if="canRun">
                Run
                <v-icon right dark>mdi-play</v-icon>
            </v-btn>
            <div class="globalState" v-html="$compilerState.globalStateMessage" v-if="showGlobalMessages"></div>
        </div>
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
        props: {
            'blocks': Array,
            'language': String,
            'blockid': Number,
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
            run() {
                let cmp = this.$compilerRegistry.getCompiler(this.compiler);
                if (!cmp) return false;
                console.log("RUNNING", this.completeSource);
                cmp.compileAndRun(
                    this.blocks.id,
                    this.completeSource,
                    null,
                    3000,
                    function (m) {
                        console.log(m)
                    },
                    function (m) {
                        console.log("Info:" + m)
                    },
                    function (m) {
                        console.error(m)
                    },
                    function (error) {
                        console.error("Error", error);
                    },
                    function (success = true, overrideOutput = undefined) {
                        console.log("Done", success, overrideOutput, cmp.isReady, cmp.isRunning)
                        //waitdiv.innerHTML = '';  
                        if (!success) {
                            this.$compilerState.hideGlobalState();
                            this.$compilerState.setAllRunButtons(true);
                            return undefined;
                        }
                        //var res = finishedExecution(overrideOutput?overrideOutput:output, sansoutput, questionID, outdiv);
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
        button
            display: inline-block
            margin: 8px 0px !important
        .globalState
            margin-left: 10px
            display: inline-block
            color: gray
            padding-left: 4px
            padding-right: 4px
</style>