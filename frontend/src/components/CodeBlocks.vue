<template>
  <div class="codeblocks">
      {{language}}      
      <div class="block" v-for="block in blocks" :key="block.id">
          <CodeBlock v-if="block.hasCode" :block="block" :theme="block.editorTheme"></CodeBlock>
          <pre>id:{{block.id}} lines:{{block.lineCount}} first:{{block.firstLine}} next:{{block.nextLine}}</pre>
      </div>          
  </div>
</template>

<script>
import CodeBlock from '../components/CodeBlock';
export default {
    name: 'CodeBlocks',
    components: {CodeBlock},
    props: ['blocks', 'language', 'blockid']
}
</script>

<style scoped lang="sass">    
    div .codeblocks        
        border: 1px dashed silver
        border-radius: 5px
        margin: 4px
        padding: 8px
        background-color: white
        .block
            padding: 0px
            margin: 0px
</style>