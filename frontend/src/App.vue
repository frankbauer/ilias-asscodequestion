<template>
  <v-app>
    <v-content>
      <HelloWorld/> A{{ title }}A
    </v-content>
  </v-app>
</template>

<script>
import HelloWorld from './components/HelloWorld';

export default {
  name: 'App',

  props: ['title'],

  components: {
    HelloWorld,
  },

  data: () => ({
    //
  }),
};
</script>

<style lang="sass">
  
</style>
