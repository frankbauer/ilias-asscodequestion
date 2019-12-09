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
        console.log(lines)
        let markers = []
        let m;
        for (let i=0; i<lines.length; i++){
            let regex = new RegExp(randomAndTemplateTag);            
            
            while ((m = regex.exec(lines[i])) !== null) {
               if (m.index === regex.lastIndex)  regex.lastIndex++;                
            
               console.log(m)
               markers.push({
                   start:{line:i, ch:m.index},
                   end:{line:i, ch:regex.lastIndex},
                   type:m[1]==':'?'rnd':'templ',
                   name:m[2]
               })                
            }
        }
        return markers;
    }
}