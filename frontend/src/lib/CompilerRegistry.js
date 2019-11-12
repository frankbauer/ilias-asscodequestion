
import Vue from 'vue'

//prepare Compiler Registry
const compilerRegistry = new Vue({
    data: function(){
        return {
            compilers:{}
        }
    },
    computed:{        
    },
    methods: {
        register(compilers){
            this.compilers[compilers.type] = compilers;
        },
        getCompiler(compilerInfo){
            let cmps = this.compilers[compilerInfo.languageType]            
            if (!cmps) return undefined;

            let res = cmps.versions.find(e => e.version == compilerInfo.version);
            if (res===undefined) res = cmps.default;                      
            return res;
        }
    }
});

//load all available compilers
import JavaCompilers from '../compiler/java'
compilerRegistry.register(JavaCompilers);

import JavascriptCompilers from '../compiler/javascript'
compilerRegistry.register(JavascriptCompilers);

import PythonCompilers from '../compiler/python'
compilerRegistry.register(PythonCompilers);

import GLSLCompilers from '../compiler/glsl'
compilerRegistry.register(GLSLCompilers);

export default compilerRegistry;

