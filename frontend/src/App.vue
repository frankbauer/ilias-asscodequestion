<template>
  <v-app>
    <v-content>
      <HelloWorld/>
    </v-content>
  </v-app>
</template>

<script>
import HelloWorld from './components/HelloWorld';

export default {
  name: 'App',

  props: ['blocks'],

  components: {
    HelloWorld,
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
