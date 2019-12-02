<template>
    <v-container fluid class="ma-0 pa-0">
        <v-row class="my-0 py-0" dense>
            <v-col cols="12" sm="4">
                <v-card>
                    <v-card-title>Language</v-card-title>
                    <v-card-text>
                        <v-container fluid align="start" justify="start" class="ma-0 pa-0">
                            <v-row class="my-0 py-0" dense>
                                <v-col cols="12" md="8" class="my-0 py-0">
                                    <v-switch v-model="runCode" :disabled="!languageHasCompiler" label="Allow Code Execution"/>
                                </v-col>
                                <v-col cols="12" :md="`${runCode?8:12}`" class="my-0 py-0">
                                    <v-select
                                        :items="compiledLanguages"
                                        v-model="compilerLanguage"
                                                                    
                                        label="Language"
                                        dense
                                        class="rect-input"
                                    /> 
                                </v-col> 
                                <v-col cols="12" md="4" class="my-0 py-0" v-if="runCode">
                                    <v-select
                                        :items="compilerVersions"
                                        v-model="compilerVersion"
                                                                    
                                        label="Version"
                                        dense
                                        class="rect-input"
                                    />                      
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-slide-x-transition>
                <v-col cols="12" sm="4" v-if="runCode">
                    <v-card>
                        <v-card-title>Restrictions</v-card-title>
                        <v-card-text>
                            <v-container fluid align="start" justify="start" class="ma-0 pa-0">
                                <v-row class="my-0 py-0" dense>                               
                                    <v-col cols="12" :md="6" class="my-0 py-0">
                                        <v-text-field
                                            v-model="maxRuntime"
                                            :rules="[validNumber]"
                                            label="Max. Runtime in ms."                            
                                            maxlength="6"
                                            dense
                                            
                                            class="rect-input"
                                        />
                                    </v-col> 
                                    <v-col cols="12" :md="6" class="my-0 py-0">
                                        <v-text-field
                                            v-model="maxCharacters"
                                            :rules="[validNumber]"
                                            label="Max. Output Characters"                            
                                            maxlength="6"
                                            dense
                                            
                                            class="rect-input"
                                        />
                                    </v-col> 
                                </v-row>
                            </v-container>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-slide-x-transition>

            <v-slide-x-transition>
                <v-col cols="12" sm="4" v-if="runCode">
                    <v-card>
                        <v-card-title>Libraries</v-card-title>
                        <v-card-text>
                            <v-container fluid align="start" justify="start" class="ma-0 pa-0">
                                <v-row class="my-0 py-0" dense>
                                    <v-col cols="12" class="my-0 py-0">
                                        <v-select
                                            :items="domLibraries"
                                            v-model="domLibrary"
                                            multiple 
                                            chips                        
                                            label="DOM-Libraries"
                                            dense
                                            class="rect-input"
                                        /> 
                                    </v-col> 
                                    <v-col cols="12" class="my-0 py-0" v-if="runCode">
                                        <v-select
                                            :items="compilerVersions"
                                            v-model="compilerVersion"
                                            multiple   
                                            chips                         
                                            label="Worker-Libraries"
                                            dense
                                            class="rect-input"
                                        />                      
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-slide-x-transition>
        </v-row>
    </v-container>
        
</template>

<script>
export default {
    data:function(){
        return {
            
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
        domLibraries(){
            return this.$compilerRegistry.domLibraries;
        },
        compiledLanguages(){
            if (this.options.runCode === false) return this.languages;
            return this.$compilerRegistry.languages
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
        compilerLanguage:{
            get(){
                if (this.options.runCode === false) return this.options.language;
                return this.options.compiler.languageType;
            },
            set(v){
                if (this.options.runCode === false) this.$emit('language-change', v)
                this.$emit('compiler-change', v)
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
                return this.options.domLibs;
            },
            set(v){

            }
        }
    }
}
</script>

<style lang="sass" scoped>

</style>