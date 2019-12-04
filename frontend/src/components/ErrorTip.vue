<template>
    <q-icon :class="`mdi ${severityClass} mainTipIcon`" :name="severityIcon">
        <q-tooltip>
            <div>
                <ul class="tiplist">
                    <li v-for="error in errors" v-bind:key="error.message">
                        <div class="row">
                            <div class="col-1">
                                <q-icon class="" :name="iconForSeverity(error.severity)"></q-icon>
                            </div>
                            <div class="col-11 q-pr-md">
                                <div class="q-my-none tipper">{{ error.message }}</div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </q-tooltip>
    </q-icon>    
</template>

<script>

export default {
    props: ['errors', 'severity'],
    computed: {
        severityClass() { return this.classForSeverity(this.severity); },
        severityIcon() { return this.iconForSeverity(this.severity); }
    },
    methods:{
        classForSeverity(s){
            if (s == this.SEVERITY_ERROR) return "gutter-error";
            return "gutter-warning";
        },
        iconForSeverity(s){
            if (s == this.SEVERITY_ERROR) return "report";
            return "warning"
        }
    }
}
</script>

<style lang="sass">
    .mainTipIcon
        margin-top: -1px
    .tiplist
        font-size: 0.9rem
        list-style-type: none
        padding-left: 0px !important
        max-width: 480px
        min-width: 300px
        li:first-of-type
            padding: 0px 0px 0px 0px
        li
            padding: 10px 0px 0px 0px
            margin: 0px 0px 0px 0px
            .tipicon 
                display: inline
                color: white !important
                vertical-align: top
            .tipper
                vertical-align: top
                font-family: monospace
</style>