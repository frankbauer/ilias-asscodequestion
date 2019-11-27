<template>
  <v-card>
        <v-card-title class="mb-0 pb-0">
        </v-card-title>
        <v-card-text class="my-0 pt-1 pb-0">
            <v-container fluid align="start" justify="start" class="ma-0 pa-0">
                <v-row class="my-0 py-0" dense>
                    <v-col cols="12" sm="5" md="3" class="my-0 py-0">
                        <v-select
                            :items="types"
                            v-model="language"
                            outlined
                            dark
                            label="Language"
                            dense
                            class="rect-input"
                        />                        
                    </v-col>
                </v-row>
            </v-container>
        </v-card-text>
  </v-card>
</template>

<script>
export default {
    props:{
        options:{
            type:Object,
            required:true
        }
    }
}
</script>

<style lang="sass" scoped>

</style>