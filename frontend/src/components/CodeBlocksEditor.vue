
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
    }
}
</script>
