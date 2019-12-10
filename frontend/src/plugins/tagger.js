import Vue from 'vue'
const randomAndTemplateTag = /\{(:|!)([\w]+)}/g

import '../styles/tagger.styl'

Vue.$tagger = new Vue({
    data:function(){
        return { 
            className:{
                rnd:'random-tag-placeholder',
                templ:'template-tag-placeholder'
            }
        }
    },
    methods:{
        getMarkers(s){
            let lines = s.split("\n");
            let markers = []
            let m;
            for (let i=0; i<lines.length; i++){
                let regex = new RegExp(randomAndTemplateTag);            
                
                while ((m = regex.exec(lines[i])) !== null) {
                if (m.index === regex.lastIndex)  regex.lastIndex++;                
                
                markers.push({
                    start:{line:i, ch:m.index},
                    end:{line:i, ch:regex.lastIndex},
                    type:m[1]==':'?'rnd':'templ',
                    name:m[2]
                })                
                }
            }
            return markers;
        },
        processElements: function(scope){            
            let uuid = undefined
            if (scope === undefined) {
                scope = document        
            } else if (!scope.hasAttribute('uuid')) {
                uuid = this.$uuid.v4()
                scope.setAttribute('uuid', uuid)
            } else {
                uuid = scope.getAttribute('uuid')
            }
            
            const elements = scope.querySelectorAll('[tagged]');
            console.log(elements)
            elements.forEach(el => {
                this.processElement(el, uuid);
            })
        },
        processElement: function(el, scopeUUID){        
            el.innerHTML = this.processString(el.innerHTML, scopeUUID);
            this.hookClick(el, scopeUUID);
        }, 
        processString: function(str, scopeUUID){        
            return str.replace(randomAndTemplateTag, (m0, m1, m2)=>{
                const className = m1===':'?this.className.rnd:this.className.templ;
                return `<span class="q-mb-xs ${className}" >` + m0 + '</span>';
            });            
        },       
        hookClick: function(el, scopeUUID){
            let tags = el.querySelectorAll('.'+this.className.templ);
            tags.forEach(tag => {
                let name = tag.innerText.replace(randomAndTemplateTag, (m0, m1, m2)=>{
                    return m2
                })
                tag.onclick = () => {this.clickFunction(name, tag, scopeUUID)};
            })
        },
        replaceTemplateTag(scope, name, newValue){
            if (scope === undefined) scope = document
            let tags = scope.querySelectorAll('.'+this.className.templ);
            tags.forEach(tag => {
                tag.innerHTML = this.replaceTemplateTagInString(tag.innerHTML, name, newValue);
            })
        },
        replaceTemplateTagInString(str, name, newValue){
            return str.replace(randomAndTemplateTag, (m0, m1, m2)=>{
                if (m1 == '!' && m2 == name){
                        return newValue;
                }
                return m0;
            })
        },
        clickFunction: function(name, tagEl, scopeUUID){
            Vue.prototype.$q.dialog({
                title: 'Confirm Tag Replacement',
                message: 'Do you really want to replace <b>all</b> occurances of the <span class="template-tag-placeholder-noclick">'+name+'</span> Template with the below value?',
                html: true,
                persistent: true,
                prompt: {
                    model: '{!'+name+'}',
                    type: 'text' // optional
                },
                ok: {
                    push: true,
                    color: 'negative',
                    icon: 'warning'
                },
                cancel: {
                    push: true,
                    color: 'positive'
                },
                persistent: true
            }).onOk((data) => {
                //this.replaceTemplateTag($(tagEl).parents(".codeblocks").get(0), name, data)
                this.replaceTemplateTag($(`[uuid=${scopeUUID}]`).get(0), name, data)
                console.log(scopeUUID)
                this.$emit('replace-template-tag', {
                    name:name,
                    newValue: data, 
                    scopeUUID: scopeUUID
                })
            }).onCancel(() => {                
            }).onDismiss(() => {
                self.highlighted = false;                
            })
        }
    }
});

Vue.directive('tagged', {
    deep: true,
    bind: function (el, binding) {
        Vue.$tagger.processElement(el, binding.value);
    },
    componentUpdated: function (el, binding) {
        //console.log("DIRECTIVE - update", el, binding)
        Vue.$tagger.processElement(el, binding.value);
    }
})