<template>
  <div id="app">

      <date-picker type="multi" v-model="value"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import DatePicker from '@/components/DatePicker.vue'

import './lib'

@Component({
  components: {
    DatePicker
  }
})
export default class App extends Vue {
  value = null
}

</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
