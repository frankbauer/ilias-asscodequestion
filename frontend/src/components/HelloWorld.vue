<template>
  <v-card class="mx-12">
    <v-app-bar
      dark
      color="pink"
    >
      <v-app-bar-nav-icon></v-app-bar-nav-icon>

      <v-toolbar-title>My Music</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn icon>
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
    </v-app-bar>
    <v-container>
      Hello World
    </v-container>
  </v-card>
</template>

<script>
export default {
  name: 'HelloWorld',  
  data: () => ({
   
  }),

};
</script>
