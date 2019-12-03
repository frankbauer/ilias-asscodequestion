
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
                .map(c => {return {label:c.displayName, value:c.type}})
                .sort((a, b) => a.label < b.label ? -1 : 1)
            return langs
        },
        domLibraries(){
            const libs = this.libraries.filter(l=>!l.utility);
            return libs.map(l => {return { label: l.displayName + ' ('+l.version+')', value:l.key}});
        }   
    },
    methods: {
        register(compilers){
            if (Array.isArray(compilers)){
                compilers.forEach(c => this.registerSingle(c))
            } else {
                this.registerSingle(compilers);
            }
        },
        registerSingle(c){
            this.compilers[c.type] = c            
            c.versions.forEach( v => {
                if (v.registerLibs) {
                    v.registerLibs(this);
                }
            })
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
        registerDOMLib(uri, name, version, displayName, utility=false){
            this.libraries.push({
                key:name+"-"+version,
                uri:uri,
                name:name,
                version:version,
                displayName:displayName,
                didLoad:false,
                utility:utility
            })
        },
        getLibObjects(domLibs){
            return  this.libraries.filter(l => domLibs.indexOf(l.key)>=0);
        },
        urisForDOMLibs(domLibs){
            const libs = this.getLibObjects(domLibs);
            const uris = libs
                .filter(l=> !l.didLoad)
                .map(l => l.uri)                
                .reduce((p, c) => c.concat(p), []);
            
            return uris;
        },
        loadLibraries(domLibraries, whenLoaded){            
            const libs = this.urisForDOMLibs(domLibraries);
            const dlibs = this.getLibObjects(domLibraries);
            this.loadURIs(libs, function(){                
                dlibs.forEach(l => l.didLoad = true)
                whenLoaded();
            }.bind(this))
        }, 
        loadURIs(libs, whenLoaded){
            let loadLib = function(uris, idx){
                if (idx>=uris.length) {
                    whenLoaded();
                    return;
                }

                const uri = uris[idx];
                let script = document.createElement('script');
                script.src = uri;
                script.onload = function () {                    
                    loadLib(uris, idx+1);
                };
                document.head.appendChild(script);
            };

            loadLib(libs, 0);
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


compilerRegistry.registerDOMLib(
    [
        Vue.$CodeBlock.baseurl+'js/d3/5.3.8/d3.v5.min.js'
    ], 
    'd3', 
    '5.13.4', 
    'D3'
)


compilerRegistry.registerDOMLib(
    [
        Vue.$CodeBlock.baseurl+'js/three.js/r0/three.min.js',
        Vue.$CodeBlock.baseurl+'js/three.js/r0/controls/OrbitControls.js',
        Vue.$CodeBlock.baseurl+'js/three.js/r0/controls/TrackballControls.js',
        Vue.$CodeBlock.baseurl+'js/three.js/r0/Detector.js'
    ], 
    '3js', 
    'r0', 
    'Three.JS'
)
export default compilerRegistry;

