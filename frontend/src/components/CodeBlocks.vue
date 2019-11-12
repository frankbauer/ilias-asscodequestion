<template>
  <div class="codeblocks">
      {{language}}      
      <div class="block" v-for="block in blocks" :key="block.id">
          <CodeBlock v-if="block.hasCode" :block="block" :theme="block.editorTheme" :mode="mimeType" :visibleLines="block.visibleLines" :editMode="editMode"></CodeBlock>      
      </div>   
      {{isReady}}       
  </div>
</template>

<script>
import CodeBlock from '../components/CodeBlock';

/**
 * This object defines the programming languages supported for code highlighting
 * using CodeMirror
 * @namespace cmMode The programminglanguages supported
 */
const mimeTypesForLanguage = {
    'c': 'text/x-csrc', // (C),
    'c++': 'text/x-c++src', // (C++),
    'c#': 'text/x-csharp', // (C#),
    'css': 'text/css', // (CSS)
    'fortran': 'text/x-fortran', // (Fortran)
    'glsl': 'text/x-glsl', // (GLSL)
    'html': 'text/html', // (HTML)
    'java': 'text/x-java', // (Java),
    'java2': 'text/x-java', // (Java),
    'javascript': 'text/javascript', // (JavaScript)
    'objectivec': 'text/x-objectivec', // (Objective-C),
    'perl': 'text/x-perl', // (Perl)
    'php': 'application/x-httpd-php', // (PHP)
    'python': 'text/x-python',// (Python)
    'r': 'text/x-rsrc', //(R)
    'ruby': 'text/x-ruby', // (Ruby)
    'sql': 'text/x-mysql', // (mysql)
    'xml': 'application/xml' //text/html (XML)
};


export default {
    name: 'CodeBlocks',
    components: {CodeBlock},
    props: {
        'blocks':Array, 
        'language':String, 
        'blockid':Number, 
        'editMode':{
            type:Boolean,
            default:false
        }, 
        'compiler':{
            type:Object,
            default:{
                languageType:'none',
                version:'1'
            }
        }
    },
    computed: {
        mimeType(){
            return mimeTypesForLanguage[this.language];
        },
        isReady(){            
            let cmp = this.$compilerRegistry.getCompiler(this.compiler);
            console.log(cmp);
            if (!cmp) return false;

            return cmp.isReady;        
        }
    },
    created(){
        let cmp = this.$compilerRegistry.getCompiler(this.compiler);
        if (cmp){
            cmp.preload();
        }
    }
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