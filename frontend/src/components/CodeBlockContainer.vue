<template>
  <div class="block">
    <v-card v-if="editMode" class="ml-0 mr-0 my-3 pa-0" >
        <div :class="colorClass" style="height:4px" />
        <v-card-text class="mb-0 pb-0">
            <v-container fluid align="start" justify="start" class="ma-0 pa-0">
                <v-row class="my-0 py-0" dense>
                    <v-col cols="12" sm="5" md="3" class="my-0 py-0">
                        <v-select
                            :items="types"
                            v-model="type"
                            outlined
                            label="Block Type"
                            dense
                            class="rect-input"
                        />                        
                    </v-col>

                    <!-- LineNumbers -->
                    <v-col v-if="canSetLineNumbers" cols="4" sm="2" md="2" class="my-0 py-0">
                        <v-text-field
                            v-model="visibleLines"
                            :rules="[validNumber]"
                            label="Visible Lines"                            
                            maxlength="4"
                            dense
                            outlined
                            class="rect-input"
                        />
                    </v-col>

                    <!-- Playground Versioning -->
                    <v-col v-if="canDefinePlacement" cols="12" md="2" class="my-0 py-0">
                        <v-select
                            :items="scriptVersions"
                            v-model="scriptVersion"
                            outlined
                            label="Script Version"
                            dense
                            class="rect-input"
                        />
                    </v-col>
                    <!-- Playground Placement Settings -->
                    <v-col v-if="canDefinePlacement" cols="4" md="1" class="my-0 py-0">
                        <v-text-field
                            v-model="width"
                            label="CSS width"                            
                            maxlength="7"
                            dense
                            outlined
                            class="rect-input"
                        />
                    </v-col>
                    <v-col v-if="canDefinePlacement" cols="4" md="1" class="my-0 py-0">
                        <v-text-field
                            v-model="height"
                            label="CSS height"                            
                            maxlength="7"
                            dense
                            outlined
                            class="rect-input"
                        />
                    </v-col>
                    <v-col v-if="canDefinePlacement" cols="4" md="2" class="my-0 py-0">
                        <v-select
                            :items="alignments"
                            v-model="align"
                            outlined
                            label="Align"
                            dense
                            class="rect-input"
                        /> 
                    </v-col>
                   <v-spacer class="hidden-sm-and-down"></v-spacer>
                    <v-col cols="12" sm="12" md="1" class="my-0 py-0 text-right">
                        <v-btn 
                            :fab="!expanded"
                            :text="expanded"
                            :icon="expanded"
                            color="primary" 
                            small 
                            v-blur
                            @click="toggleExpanded">
                                <v-icon size="24">
                                    {{ expanded?'mdi-chevron-up':'mdi-chevron-down'}}
                                </v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
            </v-container>
            <textarea :name="`block_options[${this.block.parentID}][${this.block.id}]`" class="blockoptions" v-model="serializedOptions"></textarea>
        </v-card-text>   
        <v-expand-transition>     
            <v-card-text class="my-0 pt-1 pb-0" v-show="expanded">                                     
                <slot ></slot>            
            </v-card-text>
        </v-expand-transition>
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
            expanded:true,
            alignments:[
                {
                    text:'Start',
                    value:'left'
                },{
                    text:'Center',
                    value:'center'
                },{
                    text:'End',
                    value:'right'
                }],
            scriptVersions:[
                {
                    text:'1.0 (original)',
                    value:'100'
                },{
                    text:'2.0 (since 2020)',
                    value:'101'
                }],
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
    methods:{
        validNumber(v){
            if (v!='auto' || isNaN(v)) return "Must be a valid Number or 'auto'."
            return true
        },
        toggleExpanded(){
            this.expanded = !this.expanded;
        }
    },
    computed:{
        serializedOptions:{
            get(){
                let obj = {};
                Object
                    .keys(this.block)
                    .filter(k => k.indexOf('$')!=0 && k.indexOf('_')!=0 && k!='obj' && k!='errors' && k!='content' && k!='firstLine' && k!='nextLine' && k!='lineCount' && k!='hasCode')
                    .forEach(k => obj[k] = this.block[k])
                
                return JSON.stringify(obj)
            },
            set(v){}
        },
        isVersionedPlayground(){
            return this.type=="PLAYGROUND";
        },
        canSetLineNumbers(){
            return this.type=="BLOCK";
        },
        canDefinePlacement(){
            return this.type=="PLAYGROUND";
        },
        scriptVersion:{
            get(){
                if (this.block === undefined || this.block.version === undefined || this.block.version == '')
                    return '100';
                return this.block.version
            },
            set(v){
                this.$emit('script-version-change', {
                    version: v,
                    id:this.block.id
                });
            }
        },
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
        },
        visibleLines:{
            get() { return this.block.visibleLines; },
            set(v) { 
                this.$emit('visible-lines-change', {
                    visibleLines: v=='auto'?v:new Number(v),
                    id:this.block.id
                });
            }
        },
        width:{
            get() { return this.block.width; },
            set(v) { 
                this.$emit('placement-change', {
                    width: v,
                    height:this.block.height,
                    align:this.block.align,
                    id:this.block.id
                });
            }
        },height:{
            get() { return this.block.height; },
            set(v) { 
                this.$emit('placement-change', {
                    width: this.block.width,
                    height:v,
                    align:this.block.align,
                    id:this.block.id
                });
            }
        },align:{
            get() { return this.block.align; },
            set(v) { 
                this.$emit('placement-change', {
                    width: this.block.width,
                    height:this.block.height,
                    align:v,
                    id:this.block.id
                });
            }
        }
    }
}
</script>

<style lang="sass" >
.rect-input.v-input .v-input__slot 
    border-radius: 0px
</style>