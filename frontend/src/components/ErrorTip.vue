<template>
    <q-tooltip top>
        <template v-slot:activator="{ on }">
            <q-icon v-on="on" :class="`mdi ${severityClass}`">{{severityIcon}}</q-icon>            
        </template>
        <div>
            <ul class="tiplist">
                <li v-for="error in errors" v-bind:key="error.message">
                    <q-icon class="pr-3 tipicon">{{ iconForSeverity(error.severity) }}</q-icon>
                    <pre class="tipper">{{ error.message }}</pre>
                </li>
            </ul>
        </div>
    </q-tooltip>
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
            if (s == this.SEVERITY_ERROR) return "mdi-code-error";
            return "mdi-code-warning"
        }
    }
}
</script>

<style lang="sass">
    .tiplist
        list-style-type: none
        padding-left: 0px !important
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
                display: inline-block
                vertical-align: top
</style>