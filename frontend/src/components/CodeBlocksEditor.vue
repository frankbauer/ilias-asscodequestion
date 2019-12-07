
<script>
import CodeBlocks from '../components/CodeBlocks'

var mixin = {
  created: function () { console.log(1) }
}
export default {
    extends: CodeBlocks,
    computed: {
        editMode() {
            return true;
        }
    },
    methods:{
        onTypeChange(nfo){
            let bl = this.blockById(nfo.id);
            bl.type = nfo.type;
            bl.hidden = nfo.hidden;
            bl.static = nfo.static;
            bl.hasCode = nfo.hasCode;
        },
        onVisibleLinesChange(nfo){
            let bl = this.blockById(nfo.id);
            bl.visibleLines = nfo.visibleLines;
        },
        onPlacementChange(nfo){
            let bl = this.blockById(nfo.id);
            bl.width = nfo.width;
            bl.height = nfo.height;
            bl.align = nfo.align;
        },
        onCompilerChange(v){
            const c = this.$compilerRegistry.getCompiler({languageType:v});
            if (c!==undefined){
                console.log("Selected Compiler", c, v, this.blockInfo.compiler)
                this.blockInfo.compiler.languageType = v
                this.blockInfo.compiler.version = c.version
                this.blockInfo.language = c.language

                console.log("PRELOADING")
                c.preload();                
            }
        },
        onCompilerVersionChange(v){
            console.log("Selected Version", v, this.blockInfo.compiler.languageType)
            const c = this.$compilerRegistry.getCompiler({languageType:this.blockInfo.compiler.languageType, version:v});
            this.blockInfo.compiler.version = v

            if (c!==undefined){
                this.blockInfo.language = c.language

                console.log("PRELOADING")
                c.preload(); 
            }
        },
        onRunStateChange(v){
            this.blockInfo.runCode = v;
        },
        onLanguageChange(v){
            this.blockInfo.language = v;
        },
        onCharacterLimitChange(v){
            this.blockInfo.maxCharacters = v;            
        },
        onTimeoutChange(v){
            this.blockInfo.executionTimeout = v;
        },  
        onWorkerLibChange(v){
            this.blockInfo.workerLibs = v;
        },
        onDomLibChange(v){
            this.blockInfo.domLibs = v;
        },
        onScriptVersionChange(nfo){
            
            let bl = this.blockById(nfo.id);
            console.log(bl, nfo);
            bl.version = nfo.version;
            if (bl.obj) bl.obj.version = nfo.version;
        },
        onThemeChange(nfo){
            this.blockInfo.solutionTheme = nfo.solution;
            this.blockInfo.codeTheme = nfo.code
        },
        moveUp(idx){
            this.blockInfo.moveUp(idx);
        },
        moveDown(idx){
            this.blockInfo.moveDown(idx);
        },
        addNewBlock(){
            this.blockInfo.addNewBlock();
        },
        removeBlock(idx){
            this.blockInfo.removeBlock(idx);
        },
    }
}
</script>
