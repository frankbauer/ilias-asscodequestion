<template>
  <div v-html="content"></div>
</template>

<script>
export default {
    name:"simpletext",
    props:{
        content:"",
        'editMode': {
            type: Boolean,
            default: false
        }
    }
}
</script>

<style lang="sass" scoped>

</style>