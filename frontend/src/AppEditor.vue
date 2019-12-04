<template>
  <q-layout view="hHh lpR fFf" style="min-height:0">

    <q-page-container>
       <CodeBlocksEditor :blockInfo="blocks" />
    </q-page-container>

  </q-layout>  
  
</template>

<script>
import CodeBlocksEditor from './components/CodeBlocksEditor';
import Vue from 'vue'

export default {
  name: 'AppEditor',

  props: ['blocks'],

  components: {
    CodeBlocksEditor,
  },

  data: () => ({
    
  }),
  computed:{
    
  }
};
</script>

<style lang="sass">
  #app
    margin-bottom: 16px
    background-color: rgba(1,1,1,0)
</style>
