
import Vue from 'vue'

//prepare Compiler Registry
const compilerRegistry = new Vue({
    data: function(){
        return {
            compilers:{}
        }
    },
    computed:{  
        languages(){
            const langs = Object
                .keys(this.compilers)
                .map(k => this.compilers[k])
                .map(c => {return {text:c.displayName, value:c.type}})
                .sort((a, b) => a.text < b.text ? -1 : 1)
            return langs
        }      
    },
    methods: {
        register(compilers){
            if (Array.isArray(compilers)){
                compilers.forEach(c => this.compilers[c.type] = c)
            } else {
                this.compilers[compilers.type] = compilers;
            }
        },
        getCompiler(compilerInfo){
            let cmps = this.compilers[compilerInfo.languageType]            
            if (!cmps) return undefined;

            let res = cmps.versions.find(e => e.version == compilerInfo.version);
            if (res===undefined) res = cmps.default;                      
            return res;
        },
        versionsForLanguage(languageType){
            const c = this.compilers[languageType];
            if (c===undefined) return ['none'];
            return c.versions.map(v => v.version);
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

