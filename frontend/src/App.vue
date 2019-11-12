<template>
  <v-app>
    <v-content>
      <CodeBlocks :blocks="blocks.blocks" :language="blocks.language" :blockid="blocks.id" />
    </v-content>
  </v-app>
</template>

<script>
import CodeBlocks from './components/CodeBlocks';

export default {
  name: 'App',

  props: ['blocks'],

  components: {
    CodeBlocks,
  },

  data: () => ({
    //
  }),
};
</script>

<style lang="sass">
  #app
    margin-bottom: 16px
    background-color: rgba(1,1,1,0)
    .v-application--wrap
      min-height: 1vh!important
</style>
