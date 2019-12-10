<template>
    <div class="row q-ma-0 q-pa-0" >    
        <div class="col-xs-12 col-md-6 q-px-sm">    
            <q-input
                ref="editBox"
                type="textarea"
                autogrow
                filled
                :name="name"
                label="HTML Source"
                background-color="blue-grey darken-3"                                
                v-model="text"
                class="plain accqstXmlInput noRTEditor"
                >
            </q-input>
        </div>
        <div class="col-xs-12 col-md-6 q-px-sm">    
            <div class="q-field__label no-pointer-events ellipsis text-caption wysiwyg">Preview</div>
            <div v-html="text" v-highlight="language" v-tagged="scopeUUID"></div>
        </div>
    </div>
</template>

<script>
    import Vue from 'vue'
    export default {
        components: {
            
        },
        data: () => ({
            // declare extensions you want to use            
        }),
        computed: {
            text:{
                get() { 
                    return this.value
                },
                set(v) { 
                    this.updatedContent(v)
                }
            }
        },
        methods: {
            updatedContent(v) {
                this.$emit('input', v);
            },
            replaceTemplateTags(o){
                if (!this.editMode) return;
                if (!o.scopeUUID != this.scopeUUID) return
                this.updatedContent(Vue.$tagger.replaceTemplateTagInString(this.text, o.name, o.newValue))
            }
        },
        props: {
            value: '',
            name: '',
            scopeUUID: '',
            language:undefined
        },
        mounted(){
            //we need this for StudON to make sure tinyMCE is not taking over :D
            this.$refs.editBox.$el.querySelectorAll('textarea[name]').forEach(el => {
                el.className = (el.className + " accqstXmlInput noRTEditor").trim();
            })             
            Vue.$tagger.$on('replace-template-tag', this.replaceTemplateTags);
        },
        beforeDestroy(){
            Vue.$tagger.$off('replace-template-tag', this.replaceTemplateTags);
        }
    }
</script>

<style lang="stylus" scoped>
.plain
    z-index:2
    border-radius:0px !important

.wysiwyg
    z-index:50
</style>