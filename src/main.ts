import Vue from 'vue'
import Demo from './Demo.vue'
import { OffisyDatePicker } from '@/lib'
import { de } from 'date-fns/locale'

Vue.config.productionTip = false

Vue.use(OffisyDatePicker, {
  locale: de,
})

new Vue({
  render: h => h(Demo),
}).$mount('#app')
