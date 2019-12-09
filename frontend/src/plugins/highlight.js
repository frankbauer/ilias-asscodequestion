import Vue from 'vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/ocean.css'
import '../styles/highlight.styl'

hljs.configure({useBR: false});

hljs.registerLanguage('c', require('highlight.js/lib/languages/cpp'));
hljs.registerLanguage('c++', require('highlight.js/lib/languages/cpp'));
hljs.registerLanguage('c#', require('highlight.js/lib/languages/cs'));
hljs.registerLanguage('css', require('highlight.js/lib/languages/css'));
hljs.registerLanguage('fortran', require('highlight.js/lib/languages/fortran'));
hljs.registerLanguage('glsl', require('highlight.js/lib/languages/glsl'));
hljs.registerLanguage('html', require('highlight.js/lib/languages/xml'));
hljs.registerLanguage('java', require('highlight.js/lib/languages/java'));
hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'));
hljs.registerLanguage('objectivec', require('highlight.js/lib/languages/objectivec'));
hljs.registerLanguage('perl', require('highlight.js/lib/languages/perl'));
hljs.registerLanguage('php', require('highlight.js/lib/languages/php'));
hljs.registerLanguage('python', require('highlight.js/lib/languages/python'));
hljs.registerLanguage('r', require('highlight.js/lib/languages/r'));
hljs.registerLanguage('ruby', require('highlight.js/lib/languages/ruby'));
hljs.registerLanguage('sql', require('highlight.js/lib/languages/sql'));
hljs.registerLanguage('xml', require('highlight.js/lib/languages/xml'));

const reg_hl=/(\[hl\]|\[hl\s+language="?(.*?)"?\])(.*?)(\[\/hl\])/gm
const reg_code=/(\[code\]|\[code\s+language="?(.*?)"?\])(.*?)(\[\/code\])/gms


hljs.$vue = {
    processElements: function(scope, inLang){
        if (scope === undefined) scope = document        
        const elements = document.querySelectorAll('[highlight]');
        elements.forEach(el => {
            if (inLang === undefined && el.hasAttribute('highlight')){
                inLang = el.getAttribute('highlight');
            }
            this.processElement(el , inLang);
        })
    },
    processElement: function(el, inLang){
        if (inLang === undefined && el.hasAttribute('highlight')){
            inLang = el.getAttribute('highlight');
        }
        //console.log("update in ", el.innerHTML, inLang)
        
        el.innerHTML = el.innerHTML.replace(reg_hl, function(m1, m2, m3, m4, m5){
            const lang = m3===undefined?inLang:m3;
            //console.log("m1", m1, "m2", m2, "m3", m3, "m4", m4, "m5", m5, "in", inLang, "res", lang)
            if (lang) return '<span is-code>'+hljs.highlight(lang, m4).value + '</span>';
            else return '<span is-code>'+hljs.highlightAuto(m4).value + '</span>';
        });
        
        el.innerHTML = el.innerHTML.replace(reg_code, function(m1, m2, m3, m4, m5){
            const lang = m3===undefined?inLang:m3;
            m4 = m4.replace(/<br( +\/)?>/g, "\n").replace(/&nbsp;/g, " ");
            if (lang) return '<pre is-code>'+hljs.highlight(lang, m4).value + '</pre>';
            else return '<spprean is-code>'+hljs.highlightAuto(m4).value + '</pre>';
        });
    }
};

window.highlightAll = function() {
    hljs.$vue.processElements();
}
Vue.$hljs = hljs

Vue.directive('highlight', {
    deep: true,
    bind: function (el, binding) {
        //console.log("DIRECTIVE - bind", el, binding)        
        hljs.$vue.processElement(el, binding.value);
    },
    componentUpdated: function (el, binding) {
        //console.log("DIRECTIVE - update", el, binding)
        hljs.$vue.processElement(el, binding.value);
    }
})

