<template>
    <v-container fluid class="ma-0 pa-0">
        <v-row class="my-0 py-0" dense>
            <v-col cols="4">
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
                                        outlined                            
                                        label="Language"
                                        dense
                                        class="rect-input"
                                    /> 
                                </v-col> 
                                <v-col cols="12" md="4" class="my-0 py-0" v-if="runCode">
                                    <v-select
                                        :items="compilerVersions"
                                        v-model="compilerVersion"
                                        outlined                            
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
    computed:{
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
                console.log(this.options, this.options.compiler.version,this.compilerLanguage, this.compilerVersions);
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
                console.log("runCode", v)
                this.$emit('run-state-change', v)
            }
        }
    }
}
</script>

<style lang="sass" scoped>

</style>