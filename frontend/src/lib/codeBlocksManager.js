import ScriptBlock from './scriptBlock'
//import vuetify from '../plugins/quasar';
import Vue from 'vue'
import App from '../App.vue'
import AppEditor from '../AppEditor.vue'

import CompilerRegistry from '../lib/CompilerRegistry'
Vue.prototype.$compilerRegistry = CompilerRegistry;



//this will handle the vue mounting on the dom
class CodeBlocksManager {
    constructBlock(data, bl){
        return new Vue({
            data:function(){return bl;},
            computed:{ 
                isLast(){
                    return this.id == data.blocks.length-1;
                },                                     
                firstLine(){
                    if (this.id == 0) return 1;
                    return data.blocks[this.id-1].nextLine;
                },
                lineCount(){
                    if (!this.hasCode) return 0;
                    return this.content.split('\n').length;
                },
                nextLine(){
                    if (!this.hasCode) return this.firstLine;
                    return this.firstLine + this.lineCount;
                }
            }
        })
    }
    constructor(el) {
        //console.log("Element", el.dataset);
        this.element = el;
        let data = {
            ...el.dataset,
            editMode: el.tagName == 'CODEBLOCKSEDITOR',
            blocks: []
        };

        if (data.compiler===undefined){
            data.runCode = false
        } else {
            data.compiler = {
                languageType : data.compiler,
                version : data.compilerVersion
            }
            const c = CompilerRegistry.getCompiler({languageType:data.compiler.languageType, version:data.compiler.version});
            if (c===undefined){
                data.runCode = false
                data.language = data.compiler.languageType
            } else {
                data.runCode = data.runCode=='true' || data.runCode=='0';
                data.language = c.language
            }
            
            delete data.compilerVersion;        
        }
        
        if (data.domLibs===undefined){
            data.domLibs = []
        } else {
            data.domLibs = JSON.parse(data.domLibs);
        }

        if (data.workerLibs===undefined){
            data.workerLibs = []
        } else {
            data.workerLibs = JSON.parse(data.workerLibs);
        }

        if (data.solutionTheme===undefined){
            data.solutionTheme = 'solarized light';
        } 

        if (data.codeTheme===undefined){
            data.codeTheme = 'xq-light';
        } 

        data.id = Number(data.id);

        if (data.executionTimeout === undefined) data.executionTimeout = 5000
        else data.executionTimeout = Number(data.executionTimeout);

        if (data.maxCharacters === undefined) data.maxCharacters = 1000
        else data.maxCharacters = Number(data.maxCharacters);   
        
        

        el.querySelectorAll("*").forEach(bl => {
            let block = {
                ...bl.dataset,
                hasCode: false,
                type: bl.tagName,
                content: bl.textContent,
                id: data.blocks.length,
                uid: data.blocks.length + '-' + (new Date()).getTime(),
                parentID: data.id,
                expanded: true,
                width: '100%',
                height: '200px',
                align: 'center',
                obj: null,                
                errors:[]
            }

            block.readonly = block.readonly !== undefined && block.readonly != "false" && block.readonly != "0";
            block.static = block.static !== undefined && block.static != "false" && block.static != "0";
            block.hidden = block.hidden !== undefined && block.hidden != "false" && block.hidden != "0";
            block.visibleLines = block.visibleLines === undefined ? 'auto' : block.visibleLines;            

            if (block.type == 'PLAYGROUND') {                
                block.obj = new ScriptBlock(block.content, block.version);  
                
                block.width = bl.getAttribute('width')?bl.getAttribute('width'):block.width
                block.height = bl.getAttribute('height')?bl.getAttribute('height'):block.height
                block.align = bl.getAttribute('align')?bl.getAttribute('align'):block.align                
            } else if (block.type == 'BLOCK') {
                block.hasCode = true;                
            } else if (block.type == 'LOADING' || block.type == 'DIV') {
                return;
            }

            data.blocks.push(this.constructBlock(data, block));
        })
        this.data = data;   
        
        //console.log("DATA", data)
    }

    instantiateVue(){
        const data = this.data;
        const self = this;
        new Vue({
            render: function (h) {
                const context = {
                    props: {
                        language:data.language,
                        id: data.question,
                        blocks: new Vue({
                            data: function(){ return data;},
                            computed: {},
                            methods: {
                                swap(id1, id2){
                                    const a = this.blocks[id1];
                                    this.blocks[id1] = this.blocks[id2];   
                                    this.blocks[id2] = a;                         
                                    
                                    this.blocks[id1].id = id1;
                                    this.blocks[id2].id = id2;
                                },
                                moveUp(id){
                                    if (id<=0) return;
                                    this.swap(id-1, id);
                                },
                                moveDown(id){
                                    if (id>=this.blocks.length-1) return;
                                    this.swap(id, id+1);
                                },
                                removeBlock(idx){
                                    data.blocks.splice(idx, 1)
                                    for (let i=idx; i<data.blocks.length; i++){
                                        data.blocks[i].id = i;
                                    }
                                },
                                addNewBlock(){
                                    let block = {
                                        hasCode: true,
                                        type: 'BLOCK',
                                        content: "",
                                        id: data.blocks.length,
                                        uid: data.blocks.length + '-' + (new Date()).getTime(),
                                        parentID: data.id,
                                        expanded: true,
                                        width: '100%',
                                        height: '200px',
                                        align: 'center',
                                        obj: null,
                                        readonly: false,
                                        static: true,
                                        hidden: false,
                                        version: 101,                
                                        errors:[]
                                    }
                                    data.blocks.push(self.constructBlock(data, block));
                                }
                            }
                        })
                    }
                };
                return h(data.editMode?AppEditor:App, context)
            },
        }).$mount(this.element)
    }
}

export default {
    find(scope) {
        if (scope === undefined) scope = document;
        const allCodeBlockParents = scope.querySelectorAll("codeblocks, codeblockseditor");
        let result = [];
        allCodeBlockParents.forEach(el => {
            result.push(new CodeBlocksManager(el));
        });

        result.mount = function(){
            result.forEach(el => el.instantiateVue());
        }
        return result;
    }
}