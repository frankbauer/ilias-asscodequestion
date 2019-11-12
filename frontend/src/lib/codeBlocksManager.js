import ScriptBlock from './scriptBlock'
import vuetify from '../plugins/vuetify';

let Vue, App;
class CodeBlocksManager {
    constructor(el) {
        this.element = el;
        let data = {
            ...el.dataset,
            blocks: []
        };

        el.querySelectorAll("*").forEach(bl => {
            let block = {
                ...bl.dataset,
                type: bl.tagName,
                content: bl.textContent
            }
            if (block.type == 'PLAYGROUND') {                
                block.obj = new ScriptBlock(block.content);
                block.obj.init();
                block.content = '';
            }
            data.blocks.push(block);
        })
        this.data = data;

        console.log(data);
        
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
                        blocks: data
                    }
                };
                return h(App, context)
            },
        }).$mount(this.element)
    }
}

export default {
    find(_App, _Vue, scope) {
        Vue = _Vue;
        App = _App;
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