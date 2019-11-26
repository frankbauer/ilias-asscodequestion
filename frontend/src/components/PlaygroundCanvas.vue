<template>
  <div ref="innerPlaygroundContainer" class="playground">{{output}}</div>
</template>

<script>
export default {    
    props: {
        output : '',
        obj:{
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
            console.log("Will Init", this.canvas, $(this.canvas).css('background-color'));    
            this.obj.init($(this.canvas));
        }
        this.$emit('canvas-change', this.canvas);
    }
}
</script>

<style type="sass" scoped>

</style>