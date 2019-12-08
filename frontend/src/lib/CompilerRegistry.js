
import Vue from 'vue'

//prepare Compiler Registry
const compilerRegistry = new Vue({
    data: function(){
        return {
            compilers:{},
            libraries:[],
            loadedURIs:[],
            afterLoadFinished:[],
            isLoadingLibs:false
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
        registerDOMLib(uri, name, version, displayName, utility=false, order=0){
            this.libraries.push({
                key:name+"-"+version,
                uri:uri,
                name:name,
                version:version,
                displayName:displayName,
                didLoad:false,
                utility:utility,
                order:order
            })
        },
        getLibObjects(domLibs){
            return  this.libraries.filter(l => domLibs.indexOf(l.key)>=0);
        },
        urisForDOMLibs(domLibs){
            const libs = this.getLibObjects(domLibs);
            const uris = libs
                .filter(l=> !l.didLoad)
                .sort((a, b) => a.order < b.order ? 1 : -1)
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
        loadURIsIter(libs, whenLoaded){ 
            console.log(libs);
            let loadCount = 0;
            let didLoad = (u) => {
                loadCount++;
                if (loadCount == libs.length){
                    whenLoaded();
                }
            }
            libs.forEach(uri => {
                if (this.loadedURIs.indexOf(uri)>=0){
                    didLoad(uri);
                    return;
                }
                this.loadedURIs.push(uri);

                let script = document.createElement('script');
                script.src = uri;
                console.log("[Loading Library from " + uri+"]")
                script.onload = function () {  
                    console.log("[Loaded " + uri+"]")
                    didLoad(uri);
                };
                document.head.appendChild(script);
            })
        },
        loadURIs(libs, whenLoaded){
            //make sure we serialize all loads !!!
            if (this.isLoadingLibs){
                //queue the load
                this.afterLoadFinished.push(()=>{
                    this.loadURIs(libs, whenLoaded);
                })
                return;
            }
            this.isLoadingLibs = true;

            const self = this;
            
            let loadLib = function(uris, idx){
                if (idx>=uris.length) {
                    whenLoaded();

                    //something tried to queue another load
                    // => dequeu it and run it now
                    self.isLoadingLibs = false;
                    if (self.afterLoadFinished.length>0){
                        let next = self.afterLoadFinished.shift();
                        next();
                    }
                    return;
                }

                const uri = uris[idx];  

                //already loaded
                if (self.loadedURIs.indexOf(uri)>=0) {
                    loadLib(uris, idx+1);
                    return;
                }
                self.loadedURIs.push(uri);              
                
                let script = document.createElement('script');
                script.src = uri;
                console.log("[Loading Library from " + uri+"]")
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
        Vue.$CodeBlock.baseurl+'js/d3/5.3.8/d3.v5.min.js',
        Vue.$CodeBlock.baseurl+'js/d3/5.3.8/helper.js'
    ], 
    'd3', 
    '5.13.4', 
    'D3',
    false,
    1000
)


compilerRegistry.registerDOMLib(
    [
        Vue.$CodeBlock.baseurl+'js/three.js/r0/three.min.js',
        Vue.$CodeBlock.baseurl+'js/three.js/r0/controls/OrbitControls.js',
        Vue.$CodeBlock.baseurl+'js/three.js/r0/controls/TrackballControls.js',
        Vue.$CodeBlock.baseurl+'js/three.js/r0/Detector.js',
        Vue.$CodeBlock.baseurl+'js/three.js/helper.r0.js'
    ], 
    '3js', 
    'r0', 
    'Three.JS',
    false,
    2000
)
export default compilerRegistry;

