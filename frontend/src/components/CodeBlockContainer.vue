<template>
  <div class="block">
    <v-card v-if="editMode" class="mx-0 my-3 pa-0" >
        <div :class="colorClass" style="height:4px" />
        <v-card-title >
            <v-select
                :items="types"
                v-model="type"
                outlined
                label="Block Type"
                dense
            />
        </v-card-title>        
        <v-card-text class="my-0 pt-1 pb-0">
            <slot></slot>
        </v-card-text>
        <div :class="colorClass" style="height:4px"></div>
      </v-card>
      <div v-else class="ma-0 pa-0">
        <slot></slot>
      </div>
  </div>
</template>

<script>
export default {
    data:function(){
        return {
            types:[
                {
                    text:'Visualization Canvas',
                    value:'PLAYGROUND'
                },{
                    text:'Plain Text',
                    value:'TEXT'
                },{
                    text:'Hidden Code Block',
                    value:'BLOCK-hidden'
                },{
                    text:'Fixed Code Block',
                    value:'BLOCK-static'
                },{
                    text:'Solution Block',
                    value:'BLOCK'
                }]
        }
    },
    props:{
        block:{
            type:Object,
            required:true
        },
        editMode:{
            type:Boolean,
            default:false
        }
    },
    computed:{
        colorClass(){
            const t = this.type
            if (t == 'TEXT'){
                return 'blue-grey';
            } else if (t == 'PLAYGROUND'){
                return 'green accent-3';
            } else if (t == 'BLOCK'){
                return 'orange darken-3';
            } else if (t == 'BLOCK-hidden'){
                return 'pink darken-4'
            } else if (t == 'BLOCK-static'){
                return 'blue darken-2'
            }
            return 'purple accent-2'
        },
        type:{
            get(){
                if (this.block.type == 'BLOCK'){
                    if (this.block.hidden) return 'BLOCK-hidden';
                    if (this.block.static) return 'BLOCK-static';
                }
                return this.block.type
            },
            set(v){
                let ret = {
                    type:v.match(/([^-]*)/)[0],
                    hidden:v=='BLOCK-hidden',
                    static:v=='BLOCK-static',                    
                    id:this.block.id
                }
                ret.hasCode = ret.type=='BLOCK';
                
                this.$emit('type-change', ret);
            }
        }
    }
}
</script>

<style lang="sass" scoped>

</style>