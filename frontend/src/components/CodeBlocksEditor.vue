
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
    }
}
</script>
