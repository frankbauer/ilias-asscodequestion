<template>
    <div>
        <div v-if="!editMode" v-html="value"></div>
        <TipTap v-else :value="value" @input="updatedContent" class="editor q-my-3" />
    </div>
</template>

<script>
import TipTap from './TipTap'
export default {
    name:"simpletext",
    components:{TipTap},
    props:{
        value:"",
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