import Vue from 'vue'

//load all versions
import v100 from './javascript.v100'

export default new Vue({
    data: function () {
        return {
            type: "javascript",
            displayName: "JavaScript",

            //attach all version
            versions: [v100],

            //declare the default one
            default: v100
        }
    }
});