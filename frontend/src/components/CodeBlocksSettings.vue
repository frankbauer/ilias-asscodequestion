<template>
    <div class="row q-pa-none q-mb-md">
            <div class="col-xs-12 col-sm-4">
                <q-card class="q-mr-sm-xs">
                    <q-card-section class="text-overline">Language</q-card-section>
                    <q-card-section class="q-ml-md">                        
                        <div class="row">
                            <div class="col-12">
                                <q-toggle v-model="runCode" :disabled="!languageHasCompiler" label="Allow Code Execution"/>
                            </div>
                            <div :class="`col-xs-12 col-md-${runCode?8:12} ${runCode?'q-pr-md-sm':''}`">
                                <q-select
                                    :options="compiledLanguages"
                                    v-model="compilerLanguageObj"  
                                    label="Language"   
                                /> 
                            </div> 
                            <div class="col-xs-12 col-md-4" v-if="runCode">
                                <q-select
                                    :options="compilerVersions"
                                    v-model="compilerVersion"                            
                                    label="Version"    
                                />                      
                            </div>
                        </div>                        
                    </q-card-section>
                </q-card>
            </div>

            <div class="col-xs-12 col-sm-4">
                <q-slide-transition>
                    <q-card class="q-mb-sm q-mr-sm-xs" v-if="runCode">
                        <q-card-section class="text-overline">Restrictions</q-card-section>
                        <q-card-section class="q-ml-md">
                            <div class="row">                               
                                <div class="col-xs-12 col-md-6 q-pr-md-sm">
                                    <q-input
                                        v-model="maxRuntime"
                                        :rules="[validNumber]"
                                        label="Max. Runtime in ms."                            
                                        maxlength="6"
                                    />
                                </div> 
                                <div class="col-xs-12 col-md-6">
                                    <q-input
                                        v-model="maxCharacters"
                                        :rules="[validNumber]"
                                        label="Max. Output Characters"                            
                                        maxlength="6"
                                    />
                                </div> 
                            </div>
                        </q-card-section>
                    </q-card>
                </q-slide-transition>
                <q-card class="q-mr-sm-xs">
                    <q-card-section class="text-overline">Themes</q-card-section>
                    <q-card-section class="q-ml-md">
                        <div class="row" dense>
                            <div class="col-xs-12 col-md-6 q-pr-md-sm">
                                <q-select
                                    :options="themes"
                                    v-model="codeTheme"  
                                    label="General Theme"
                                /> 
                            </div>
                            <div class="col-xs-12 col-md-6">
                                <q-select
                                    :options="themes"
                                    v-model="solutionTheme"  
                                    label="Solution Theme"
                                /> 
                            </div>
                        </div>
                    </q-card-section>
                </q-card>
            </div>
            

            <q-slide-transition>
                <div class="col-xs-12 col-sm-4" v-if="runCode">
                    <q-card>
                        <q-card-section class="text-overline">Libraries</q-card-section>
                        <q-card-section class="q-ml-md">
                            <div class="row q-my-none q-py-none" dense>
                                <div class="col-xs-12 q-my-none q-py-none">
                                    <q-select
                                        :options="domLibraries"
                                        v-model="domLibrary"
                                        multiple 
                                        use-chips
                                        stack-label  
                                        deletable-chips                      
                                        label="DOM-Libraries"
                                    /> 
                                </div> 
                                <div class="col-xs-12 q-my-none q-py-none" v-if="runCode && workerLibraries.length>0">
                                    <q-select
                                        :options="workerLibraries"
                                        v-model="workerLibrary"
                                        multiple   
                                        use-chips
                                        stack-label
                                        deletable-chips                        
                                        label="Worker-Libraries" 
                                    />                      
                                </div>
                            </div>
                        </q-card-section>
                    </q-card>
                </div>
            </q-slide-transition>
        
        <div class="col-xs-12">
            <textarea :name="`block_settings[${this.options.id}]`" class="blocksettings" v-model="serializedOptions"></textarea>
        </div>
    </div>
        
</template>

<script>
export default {
    data:function(){
        return {
            themes:[
                {label:"Solarized", value:"solarized light"},
                {label:"Solarized (dark)", value:"solarized dark"},
                {label:"Base16 (dark)", value:"base16-dark"},
                {label:"Base16 (light)", value:"base16-light"},
                {label:"Duotone (dark)", value:"duotone-dark"},
                {label:"Duotone (light)", value:"duotone-light"},
                {label:"XQ (dark)", value:"xq-dark"},
                {label:"XQ (light)", value:"xq-light"},
                {label:"Blackboard", value:"blackboard"},
                {label:"neo", value:"neo"},
                {label:"mbo", value:"mbo"},
                {label:"mdn like", value:"mdn-like"}
            ]
        }
    },
    props:{
        options:{
            type:Object,
            required:true
        }
    },
    methods:{
        validNumber(v){
            if (isNaN(v)) return "Must be a valid Number."
            return true
        }
    },
    computed:{
        serializedOptions:{
            get(){                
                return JSON.stringify(this.options);
            },
            set(v){}
        },
        domLibraries(){
            return this.$compilerRegistry.domLibraries;
        },
        compiledLanguages(){
            if (this.options.runCode === false) return this.languages;
            return this.$compilerRegistry.languages
        },
        workerLibraries(){
            const c = this.$compilerRegistry.getCompiler({languageType:this.compilerLanguage, version:this.compilerVersion});
            if (c.libraries === undefined) return [];
            return c.libraries.map(l=>{ return {label:l.displayName, value:l.key};});
        },
        languages(){
            return this.$CodeBlock.knownLanguages()
        },
        compilerVersions(){
            return this.$compilerRegistry.versionsForLanguage(this.compilerLanguage);
        },
        languageHasCompiler(){
            if (this.runCode) return true;
            const c = this.$compilerRegistry.getCompiler({languageType:this.compilerLanguage});
            return c!==undefined
        },
        compilerLanguage(){
            if (this.options.runCode === false) return this.options.language;
            return this.options.compiler.languageType;
        },
        compilerLanguageObj:{
            get(){
                return this.compiledLanguages.find(t => t.value == this.compilerLanguage); 
            },
            set(v){
                if (this.options.runCode === false) this.$emit('language-change', v.value)
                this.$emit('compiler-change', v.value)
            }
        },
        compilerVersion:{
            get(){
                return this.options.compiler.version; 
            },
            set(v){
                this.$emit('compiler-version-change', v)
            }
        },
        runCode:{
            get(){
                return this.options.runCode;
            },
            set(v){
                this.$emit('run-state-change', v)
            }
        },
        maxRuntime:{
            get(){
                return this.options.executionTimeout;
            },
            set(v){
                this.$emit('timeout-change', v)                
            }
        },
        maxCharacters:{
            get(){
                return this.options.maxCharacters;
            },
            set(v){
                this.$emit('character-limit-change', v)                
            }
        },
        domLibrary:{
            get(){
                return this.options.domLibs.map(d => this.domLibraries.find(k=>k.value == d));
            },
            set(v){
                this.$emit('dom-libs-change', v.map(vv => vv.value))
            }
        },
        workerLibrary:{
            get(){
                return this.options.workerLibs.map(d => this.workerLibraries.find(k=>k.value == d));
            },
            set(v){
                this.$emit('worker-libs-change', v.map(vv => vv.value))
            }
        },
        solutionTheme:{
            get(){
                return this.themes.find(t => t.value == this.options.solutionTheme);
            },
            set(v){
                this.$emit('theme-change', {
                    solution:v.value,
                    code:this.codeTheme
                })
            }
        },
        codeTheme:{
            get(){
                return this.themes.find(t => t.value == this.options.codeTheme);
            },
            set(v){
                this.$emit('theme-change', {
                    solution:this.solutionTheme,
                    code:v.value
                })
            }
        }
    }
}
</script>

<style lang="sass" scoped>
textarea.blocksettings
    display : none !important
    width : 1px
    height : 1px
</style>