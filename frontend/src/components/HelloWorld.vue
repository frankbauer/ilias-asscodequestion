<template>
  <v-card class="mx-12">
    <v-app-bar
      dark
      color="pink"
    >
      <v-app-bar-nav-icon></v-app-bar-nav-icon>

      <v-toolbar-title>My Code </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn icon>
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
    </v-app-bar>
    <v-container>
      Hello World
      <codemirror
          :value="code" 
          :options="cmOptions"          
          :name="question">
      </codemirror>
    </v-container>
  </v-card>
</template>

<script>
import codemirror from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/solarized.css'

export default {
  name: 'HelloWorld',
  data: () => ({
      question:"test_34",
      code: 'const a = 10',
      cmOptions: {
        // codemirror options
        tabSize: 4,
        mode: 'text/java',
        theme: 'base16-dark',
        lineNumbers: true,
        line: true
      }
  }),

};
</script>
