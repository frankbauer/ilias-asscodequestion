<template>
    <v-container fluid class="ma-0 pa-0"><v-row no-gutters align="start" justify="center"  class="ma-0 pa-0"><v-col cols="12" :class="`text-${block.align}`">
        <div ref="innerPlaygroundContainer" class="playground" :style="`width:${block.width};height:${block.height}`">{{output}}</div>        
    </v-col></v-row></v-container>
</template>

<script>
export default {    
    props: {
        output : '',
        obj:{
            type:Object,
            required:true
        },
        block:{
            type:Object,
            required:true
        }
    },
    computed:{
        canvas(){
            return this.$refs.innerPlaygroundContainer;           
        }
    },
    mounted(){
        //console.log("MOUNTED");
        if (this.obj){
            //console.log("Will Init", this.canvas, $(this.canvas).css('background-color'));    
            this.obj.init($(this.canvas));
        }
        this.$emit('canvas-change', this.canvas);
    }
}
</script>

<style lang="sass" scoped>
.playground 
    display: inline-block
    width:100%
    height:200px
    border:1px dashed rgb(128, 48, 48, 0.66)
    border-radius: 3px
    background-color:rgba(255, 255, 255, 0.63766)
    margin-top:4px
    margin-bottom:4px
    transition: opacity 600ms, visibility 600ms
</style>