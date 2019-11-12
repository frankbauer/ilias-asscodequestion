import Vue from 'vue'

//load all versions
import v001 from './doppio.v001'
import v100 from './teavm.v100'

export default new Vue({
    data: function () {
        return {
            type: "java",

            //attach all version
            versions: [v001, v100],

            //declare the default one
            default: v100
        }
    }
});