<template>
    <q-container fluid class="ma-0 pa-0">
        <q-row no-gutters>    
            <q-col  cols="12" md="6">    
                <!--<tiptap-vuetify :value="value" @input="updatedContent" :extensions="extensions" :class="($vuetify.breakpoint.mdAndUp) ? 'wysiwygMD' : 'wysiwyg'"/> -->
            </q-col>
            <q-col cols="12" md="6">    
                <q-textarea
                filled
                auto-grow
                rows="1"
                name="input-7-4"
                label="Plain HTML"
                background-color="blue-grey darken-3"                
                dark
                :value="value" @input="updatedContent"
                :class="($vuetify.breakpoint.mdAndUp) ? 'plainMD' : 'plain'"></q-textarea>
            </q-col>
        </q-row>
    </q-container>
</template>

<script>
    // import the component and the necessary extensions
    /*import {
        TiptapVuetify,
        Heading,
        Bold,
        Italic,
        Strike,
        Underline,
        Code,
        Paragraph,
        BulletList,
        OrderedList,
        ListItem,
        Link,
        Blockquote,
        HardBreak,
        HorizontalRule,
        History
    } from 'tiptap-vuetify'*/

    export default {
        // specify TiptapVuetify component in "components"
        components: {
            //TiptapVuetify
        },
        data: () => ({
            // declare extensions you want to use
            /*extensions: [
                History,
                Blockquote,
                Link,
                Underline,
                Strike,
                Italic,
                ListItem,
                BulletList,
                OrderedList,
                [Heading, {
                    options: {
                        levels: [1, 2, 3]
                    }
                }],
                Bold,
                Code,
                HorizontalRule,
                Paragraph,
                HardBreak
            ]*/
        }),
        methods: {
            updatedContent(v) {
                this.$emit('input', v);
            }
        },
        props: {
            value: ''
        }
    }
</script>

<style lang="sass" scoped>
.plainMD
    padding-left:4px
.plain
    padding-top:0px
    z-index:2
    margin-top:-5px
    border-radius:0px !important

.wysiwygMD
    padding-right:4px
.wysiwyg
    padding-bottom:0px
    z-index:50
</style>