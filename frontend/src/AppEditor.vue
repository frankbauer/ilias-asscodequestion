<template>
  <v-app>
    <v-content>
      <CodeBlocksEditor :blockInfo="blocks" />
    </v-content>
  </v-app>
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
    .v-application--wrap
      min-height: 1vh!important
</style>
