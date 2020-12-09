<template>
  <div id="app">
    <div>
      <h3>Single</h3>
      <offisy-date-picker type="single" v-model="single" >
      </offisy-date-picker>

      <h3>Multi</h3>
      <offisy-date-picker type="multi" v-model="multi"/>

      <h3>Range</h3>
      <offisy-date-picker type="range" v-model="range"/>
      <br>
      <offisy-date-picker type="range" v-model="range" dual-inputs>
        <template #start-date="{}">

        </template>
        <template #end-date="{}">

        </template>
      </offisy-date-picker>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import './lib'

@Component
export default class Demo extends Vue {
  single = null
  multi = null
  range = null
}

</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  width: 100%;
  min-height: 100vmin;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
