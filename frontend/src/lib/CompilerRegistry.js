
import Vue from 'vue'

//prepare Compiler Registry
const compilerRegistry = new Vue({
    data: function(){
        return {
            compilers:{},
            libraries:[]
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
        },
        domLibraries(){
            return this.libraries.map(l => {return { text: l.displayName + ' ('+l.version+')', value:l.key}});
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
        },
        registerDOMLib(uri, name, version, displayName){
            this.libraries.push({
                key:name+"-"+version,
                uri:uri,
                name:name,
                version:version,
                displayName:displayName
            })
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


compilerRegistry.registerDOMLib([''], 'd3', '5.13.4', 'D3')
compilerRegistry.registerDOMLib([''], '3js', '5.13.4', 'Three.JS')
export default compilerRegistry;

