import Vue from 'vue'

//load all versions
import v100 from './python.v100'
import v101 from './python.v101'

export default [
new Vue({
    data: function () {
        return {
            type: "python",
            displayName: "Python 2.7",

            //attach all version
            versions: [v100, v101.legacyPython],

            //declare the default one
            default: v101.legacyPython
        }
    }
}),
new Vue({
    data: function () {
        return {
            type: "python3",
            displayName: "Python 3",

            //attach all version
            versions: [v101.python3],

            //declare the default one
            default: v101.python3
        }
    }
})];