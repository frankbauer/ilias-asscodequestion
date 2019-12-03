<template>
  <div class="block">
    <v-card v-if="editMode" :class="`ml-0 mr-0 my-3 pa-0 editModeBlockContainer ${colorClass}`" >
        <v-card-text class="mb-0 pb-0">
            <v-container fluid align="start" justify="start" class="ma-0 pa-0">
                <v-row class="my-0 py-0" dense>
                    <v-col cols="12" sm="5" md="3" class="my-0 py-0">
                        <v-select
                            :items="types"
                            v-model="type"
                            dense
                            class="rect-input"
                        />                        
                    </v-col>
                    
                    <v-spacer class="hidden-sm-and-down"></v-spacer>
                    <v-col cols="12" sm="12" md="1" class="my-0 py-0 text-right">
                        <v-menu
                            v-if="hasExtendedSettings"
                            v-model="settingsMenu"
                            left
                            :close-on-content-click="false"
                            :nudge-width="200"
                            
                            >
                            <template v-slot:activator="{ on }">
                                <v-btn icon small v-blur v-on="on">                            
                                    <v-icon size="24">
                                        mdi-settings
                                    </v-icon>
                                </v-btn>
                            </template>

                            <v-card>
                                <v-list flat>          
                                   <!-- LineNumbers -->
                                    <v-list-item v-if="canSetLineNumbers" >
                                        <v-list-item-content>
                                            <v-list-item-title>Lines</v-list-item-title>
                                            <v-list-item-subtitle>Number of Visible lines or <b>auto</b>.</v-list-item-subtitle>
                                        </v-list-item-content>
                                        <v-list-item-content>
                                            <v-text-field
                                                v-model="visibleLines"
                                                :rules="[validNumber]"
                                                maxlength="4"
                                                class="rect-input"
                                            />
                                    </v-list-item-content>
                                    </v-list-item>

                                    <!-- Playground Versioning -->
                                    <v-subheader v-if="isVersionedPlayground">VERSIONING</v-subheader>
                                    <v-list-item v-if="isVersionedPlayground"> 
                                        <v-list-item-content>
                                            <v-list-item-title>Script Version</v-list-item-title>
                                            <v-list-item-subtitle>API-Version for the Visualization Object.</v-list-item-subtitle>
                                        </v-list-item-content>
                                        <v-list-item-content>
                                            <v-select
                                                :items="scriptVersions"
                                                v-model="scriptVersion"                           
                                                class="rect-input"
                                            />
                                        </v-list-item-content>
                                    </v-list-item>
                                        
                                    <!-- Positioning -->
                                    <v-subheader v-if="canDefinePlacement">POSITIONING</v-subheader>
                                    <v-list-item v-if="canDefinePlacement">
                                        <v-list-item-content>
                                            <v-list-item-title>Width</v-list-item-title>
                                            <v-list-item-subtitle>CSS Property for the canvas-width.</v-list-item-subtitle>
                                        </v-list-item-content>
                                        <v-list-item-content>
                                            <v-text-field
                                                v-model="width"
                                                maxlength="7"                                            
                                                class="rect-input"
                                            />
                                        </v-list-item-content>
                                    </v-list-item>

                                    <v-list-item v-if="canDefinePlacement">
                                        <v-list-item-content>
                                            <v-list-item-title>Height</v-list-item-title>
                                            <v-list-item-subtitle>CSS Property for the canvas-height.</v-list-item-subtitle>
                                        </v-list-item-content>
                                        <v-list-item-content>
                                            <v-text-field
                                                v-model="height"
                                                maxlength="7"
                                                class="rect-input"
                                            />
                                        </v-list-item-content>
                                    </v-list-item>

                                    <v-list-item v-if="canDefinePlacement">
                                        <v-list-item-content>
                                            <v-list-item-title>Alignment</v-list-item-title>
                                            <v-list-item-subtitle>Horizontal Positioning of the canvas.</v-list-item-subtitle>
                                        </v-list-item-content>
                                        <v-list-item-content>
                                            <v-select
                                                :items="alignments"
                                                v-model="align"                                            
                                                dense
                                                class="rect-input"
                                            /> 
                                        </v-list-item-content>
                                    </v-list-item>                                   
                                </v-list>
                            </v-card>
                        </v-menu>
                        <v-btn 
                            icon
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
            settingsMenu:false,
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
$color-pack: false
@import '~vuetify/src/styles/settings/_colors.scss'

.text-border
    border-color : map-get($blue-grey, base) !important
.playground-border
    border-color : map-get($green, accent-3) !important
.block-border
    border-color : map-get($orange, darken-3) !important
.block-hidden-border
    border-color : map-get($pink, darken-4) !important
.block-static-border
    border-color : map-get($blue, darken-2) !important
.default-border
    border-color : map-get($purple, accent-2) !important
.editModeBlockContainer
    border-radius : 0px !important
    border-left-width : 4px !important
    border-left-style : solid !important
.rect-input.v-input .v-input__slot 
    border-radius: 0px
textarea.blockoptions
    display : none !important
    width : 1px
    height : 1px
</style>