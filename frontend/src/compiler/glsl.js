import Vue from 'vue'

//load all versions
import v100 from './glsl.v100'

export default new Vue({
    data: function () {
        return {
            type: "glsl",
            displayName: "GLSL Shader",

            //attach all version
            versions: [v100],

            //declare the default one
            default: v100
        }
    }
});