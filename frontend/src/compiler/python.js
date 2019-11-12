import Vue from 'vue'

//load all versions
import v100 from './python.v100'

export default new Vue({
    data: function () {
        return {
            type: "python",

            //attach all version
            versions: [v100],

            //declare the default one
            default: v100
        }
    }
});