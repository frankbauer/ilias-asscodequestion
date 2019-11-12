import ScriptBlock from './scriptBlock'
import vuetify from '../plugins/vuetify';
import Vue from 'vue'
import App from '../App.vue'

import CompilerRegistry from '../lib/CompilerRegistry'
Vue.prototype.$compilerRegistry = CompilerRegistry;



//this will handle the vue mounting on the dom
class CodeBlocksManager {
    constructor(el) {
        this.element = el;
        let data = {
            ...el.dataset,
            blocks: []
        };

        data.compiler = {
            languageType : data.compiler,
            version : data.compilerVersion
        }
        delete data.compilerVersion;

        data.id = Number(data.id);

        el.querySelectorAll("*").forEach(bl => {
            let block = {
                ...bl.dataset,
                hasCode: false,
                type: bl.tagName,
                content: bl.textContent,
                id: data.blocks.length,
                errors:[]
            }

            block.readonly = block.readonly !== undefined && block.readonly != "false" && block.readonly != "0";
            block.static = block.static !== undefined && block.static != "false" && block.static != "0";
            block.hidden = block.hidden !== undefined && block.hidden != "false" && block.hidden != "0";
            block.visibleLines = block.visibleLines === undefined ? 'auto' : block.visibleLines;            

            if (block.type == 'PLAYGROUND') {                
                block.obj = new ScriptBlock(block.content);
                block.obj.init();
                block.content = '';
            } else if (block.type == 'BLOCK') {
                block.hasCode = true;
            }

            data.blocks.push(new Vue({
                data:function(){return block;},
                computed:{
                    editorTheme(){
                        if (this.theme) return this.theme;                        
                        if (this.static || this.readonly || this.hidden) {
                            return 'xq-light';
                        } 
                        
                        return 'solarized light';                        
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
            }));
        })
        this.data = data;        
    }

    instantiateVue(){
        const data = this.data;
        new Vue({
            vuetify,
            render: function (h) {
                const context = {
                    props: {
                        language:data.language,
                        id: data.question,
                        blocks: new Vue({
                            data: function(){ return data;},
                            computed: {}
                        })
                    }
                };
                return h(App, context)
            },
        }).$mount(this.element)
    }
}

export default {
    find(scope) {
        if (scope === undefined) scope = document;
        const allCodeBlockParents = scope.querySelectorAll("codeblocks");
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