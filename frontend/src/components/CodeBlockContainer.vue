<template>
  <div class="block">
    <q-card v-if="editMode" :class="`ml-none q-mr-none q-my-md q-pa-none editModeBlockContainer ${colorClass}`" >
        <q-card-section class="q-mb-none q-pb-none">
            <div class="row q-my-none q-py-none" dense>
                <div class="col-xs-9 col-sm-10 col-md-4 q-my-none q-py-none">
                    <q-select
                        :options="types"
                        v-model="typeObj"
                        dense
                        style="margin-top:-5px !important"
                    />                        
                </div>
                
                <div class="col-xs-3 col-sm-2 col-md-1 q-my-none q-py-none text-right">
                    <q-btn icon="mdi-settings" > 
                        <q-popup-proxy transition-show="flip-up" transition-hide="flip-down">                        
                            <div class="row no-wrap q-pa-md" v-if="canSetLineNumbers">  
                                <!-- LineNumbers -->
                                <div class="column"  >
                                    <q-list-item-title>Lines</q-list-item-title>
                                    <q-list-item-subtitle>Number of Visible lines or <b>auto</b>.</q-list-item-subtitle>
                                </div>
                                <div class="column" >
                                    <q-input
                                        v-model="visibleLines"
                                        :rules="[validNumber]"
                                        maxlength="4"
                                    />
                                </div>
                            </div>
                            <div class="row no-wrap q-pa-md" v-if="isVersionedPlayground">                       <!-- Playground Versioning -->
                                <q-subheader>VERSIONING</q-subheader>
                                <div class="column" >                                    
                                        <q-list-item-title>Script Version</q-list-item-title>
                                        <q-list-item-subtitle>API-Version for the Visualization Object.</q-list-item-subtitle>
                                </div>
                                <div class="column" >
                                    
                                        <q-select
                                            :options="scriptVersions"
                                            v-model="scriptVersionObj" 
                                        />
                                </div>
                            </div>

                            <div class="row no-wrap q-pa-md" v-if="canDefinePlacement">                            
                                    <!-- Positioning -->
                                    <q-subheader >POSITIONING</q-subheader>
                                    <div class="column" >
                                            <q-list-item-title>Width</q-list-item-title>
                                            <q-list-item-subtitle>CSS Property for the canvas-width.</q-list-item-subtitle>
                                    </div>
                                    <div class="column" >
                                            <q-input
                                                v-model="width"
                                                maxlength="7"      
                                            />
                                        </q-list-item-content>
                                    </div>
                            </div>

                                    <q-list-item v-if="canDefinePlacement">
                                        <q-list-item-content>
                                            <q-list-item-title>Height</q-list-item-title>
                                            <q-list-item-subtitle>CSS Property for the canvas-height.</q-list-item-subtitle>
                                        </q-list-item-content>
                                        <q-list-item-content>
                                            <q-input
                                                v-model="height"
                                                maxlength="7"
                                            />
                                        </q-list-item-content>
                                    </q-list-item>

                                    <q-list-item v-if="canDefinePlacement">
                                        <q-list-item-content>
                                            <q-list-item-title>Alignment</q-list-item-title>
                                            <q-list-item-subtitle>Horizontal Positioning of the canvas.</q-list-item-subtitle>
                                        </q-list-item-content>
                                        <q-list-item-content>
                                            <q-select
                                                :options="alignments"
                                                v-model="align"    
                                            /> 
                                        </q-list-item-content>
                                    </q-list-item>                                   
                                
                            
                        </q-popup-proxy >
                    </q-btn>
                    <q-btn 
                        icon
                        color="primary" 
                        small 
                        v-blur
                        @click="toggleExpanded">
                            <q-icon :name="expanded?'mdi-chevron-up':'mdi-chevron-down'" size="24" />                                
                    </q-btn>
                </div>
            </div>
            <textarea :name="`block_options[${this.block.parentID}][${this.block.id}]`" class="blockoptions" v-model="serializedOptions"></textarea>
        </q-card-section>   
        <q-expand-transition>     
            <q-card-section class="my-0 q-pt-1 q-pb-0" v-show="expanded">                                     
                <slot ></slot>            
            </q-card-section>
        </q-expand-transition>
      </q-card>
      <div v-else class="ma-0 pa-0">
        <slot></slot>
      </div>
  </div>
</template>

<script>
export default {
    data:function(){
        return {
            settingsMenu:false,
            expanded:true,
            alignments:[
                {
                    label:'Start',
                    value:'left'
                },{
                    label:'Center',
                    value:'center'
                },{
                    label:'End',
                    value:'right'
                }],
            scriptVersions:[
                {
                    label:'1.0 (original)',
                    value:'100'
                },{
                    label:'2.0 (since 2020)',
                    value:'101'
                }],
            types:[
                {
                    label:'Visualization Canvas',
                    value:'PLAYGROUND'
                },{
                    label:'Plain Text',
                    value:'TEXT'
                },{
                    label:'Hidden Code Block',
                    value:'BLOCK-hidden'
                },{
                    label:'Fixed Code Block',
                    value:'BLOCK-static'
                },{
                    label:'Solution Block',
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
        hasExtendedSettings(){
            return this.type=="PLAYGROUND" || this.type=="BLOCK";
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
        scriptVersion(){
            if (this.block === undefined || this.block.version === undefined || this.block.version == '')
                return '100';
            return this.block.version
        },
        scriptVersionObj:{
            get(){
                return this.scriptVersions.find(k=>k.value == this.scriptVersion)
            },
            set(v){
                this.$emit('script-version-change', {
                    version: v.value,
                    id:this.block.id
                });
            }
        },
        colorClass(){
            const t = this.type
            if (t == 'TEXT'){
                return 'text-border';
            } else if (t == 'PLAYGROUND'){
                return 'playground-border';
            } else if (t == 'BLOCK'){
                return 'block-border';
            } else if (t == 'BLOCK-hidden'){
                return 'block-hidden-border'
            } else if (t == 'BLOCK-static'){
                return 'block-static-border'
            }
            return 'default-border'
        },
        type(){
    if (this.block.type == 'BLOCK'){                
                    if (this.block.hidden) return 'BLOCK-hidden';
                    if (this.block.static) return 'BLOCK-static';
                }
                return this.block.type;  
        },
        typeObj:{
            get(){
                return this.types.find(t => t.value == this.type);                
            },
            set(v){
                v = v.value
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
            get() { return this.alignments.find(k => k.value==this.block.align); },
            set(v) { 
                this.$emit('placement-change', {
                    width: this.block.width,
                    height:this.block.height,
                    align:v.value,
                    id:this.block.id
                });
            }
        }
    }
}
</script>

<style lang="sass" >

.editModeBlockContainer
    border-radius : 0px !important
    border-left-width : 4px !important
    border-left-style : solid !important
textarea.blockoptions
    display : none !important
    width : 1px
    height : 1px
</style>