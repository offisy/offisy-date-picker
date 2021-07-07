<template>
  <div id="app">
    <div>
      <h3>Single</h3>
      <offisy-date-picker type="single" v-model="single" :min="max">
      </offisy-date-picker>

      <h3>Multi</h3>
      <offisy-date-picker type="multi" v-model="multi"/>

      <h3>Range</h3>
      <offisy-date-picker type="range" v-model="range"/>
      <br>
      {{ range }}
      <br>
      <offisy-date-picker type="range" v-model="range" dual-inputs dual-calendar-pane>
      </offisy-date-picker>

      <h3>Test Date Parse</h3>
      <input type="text" v-model="testParseDateValue">
      <pre>{{ testParseDate }}</pre>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'

import './lib'
import { addDays } from 'date-fns'
import { parseDate } from '@/util/parseDate'

@Component
export default class Demo extends Vue {
  single = addDays(new Date(), -10)
  multi = null
  range = null

  max = new Date()
  testParseDateValue = '2.3'
  testParseDate: Date | boolean = parseDate(this.testParseDateValue)

  @Watch('testParseDateValue')
  watchFoo () {
    this.testParseDate = parseDate(this.testParseDateValue)
  }

  // foo4 = parseDate('')
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
