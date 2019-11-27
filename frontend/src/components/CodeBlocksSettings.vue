<template>
  <v-card>
        <v-card-title class="mb-0 pb-0">
        </v-card-title>
        <v-card-text class="my-0 pt-1 pb-0">
            <v-container fluid align="start" justify="start" class="ma-0 pa-0">
                <v-row class="my-0 py-0" dense>
                    <v-col cols="12" sm="5" md="3" class="my-0 py-0">
                        <v-select
                            :items="compiledLanguages"
                            v-model="compilerLanguage"
                            outlined                            
                            label="Language"
                            dense
                            class="rect-input"
                        /> 
                    </v-col> 
                    <v-col cols="3" sm="2" md="1" class="my-0 py-0">
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
            return this.$compilerRegistry.languages
        },
        compilerVersions(){
            return this.$compilerRegistry.versionsForLanguage(this.compilerLanguage);
        },
        compilerLanguage:{
            get(){
                console.log(this.options);
                return this.options.compiler.languageType;
            },
            set(v){
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
        }
    }
}
</script>

<style lang="sass" scoped>

</style>