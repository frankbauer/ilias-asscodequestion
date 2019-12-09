import Vue from 'vue'
const randomAndTemplateTag = /\{(:|!)([\w]+)}/g

import '../styles/tagger.styl'

Vue.$tagger = {
    className:{
        rnd:'random-tag-placeholder',
        templ:'template-tag-placeholder'
    },

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
        if (scope === undefined) scope = document        
        const elements = document.querySelectorAll('[tagged]');
        elements.forEach(el => {
            this.processElement(el);
        })
    },
    processElement: function(el){        
        el.innerHTML = el.innerHTML.replace(randomAndTemplateTag, (m0, m1, m2)=>{
            const className = m1===':'?this.className.rnd:this.className.templ;
            return `<span class="q-mb-xs ${className}">` + m0 + '</span>';
        });
        this.hoockClick(el);
    },
    hoockClick: function(el){
        let tags = el.querySelectorAll('.'+this.className.templ);
        tags.forEach(tag => {
            let name = tag.innerText.replace(randomAndTemplateTag, (m0, m1, m2)=>{
                return m2
            })
            console.log(tag, tag.innerText, name);
            
            tag.onclick = () => {this.clickFunction(name, tag)};
        })
    },
    clickFunction: function(name, tagEl){
        console.log('click', name)
    }
}

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