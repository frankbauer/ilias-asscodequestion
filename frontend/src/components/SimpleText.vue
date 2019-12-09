<template>
    <div :data-question="block.parentID" :data-nr="block.id" class="block-text">
        <div v-if="!editMode" v-html="value" v-highlight="language"></div>
        <TipTap v-else :value="value" @input="updatedContent" class="editor q-my-3" :name="name" :language="language"/>
    </div>
</template>

<script>
import TipTap from './TipTap'
export default {
    name:"simpletext",
    components:{TipTap},
    props:{
        language:undefined,
        value:"",
        name:"",
        'editMode': {
            type: Boolean,
            default: false
        }
    },
    methods:{
        updatedContent(v){
            this.$emit('input', v);
        }
    }
}
</script>

<style lang="sass" scoped>
    
</style>