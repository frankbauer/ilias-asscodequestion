import Vue from 'vue'

import v100 from './teavm.v100'

export default new Vue({
    data: function () {
        return {
            type: "java",
            versions: [v100],
            default: v100
        }
    }
});