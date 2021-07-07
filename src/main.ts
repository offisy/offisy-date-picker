import { OffisyDatePicker } from '@/lib'
import { addDays, addMonths, endOfMonth, endOfYear, format, startOfMonth, startOfYear } from 'date-fns'
import { de } from 'date-fns/locale'
import Vue from 'vue'
import Demo from './Demo.vue'

Vue.config.productionTip = false

Vue.use(OffisyDatePicker, {
  locale: de,
  presets: {
    range: {
      // today: {
      //   title: () => 'Heute',
      //   value: () => ({ startDate: new Date(), endDate: new Date() }),
      // },
      // yesterday: {
      //   title: () => 'Gestern',
      //   value: () => ({ startDate: addDays(new Date(), -1), endDate: addDays(new Date(), -1) }),
      // },
      // currentMonth: {
      //   title: () => 'Aktueller Monat',
      //   value: () => ({ startDate: startOfMonth(new Date()), endDate: endOfMonth(new Date()) }),
      // },
      lastMonth: {
        title: () => `${format(startOfMonth(addMonths(new Date(), -1)), 'MMMM yyyy', { locale: de })}`,
        value: () => ({
          startDate: startOfMonth(addMonths(new Date(), -1)),
          endDate: endOfMonth(addMonths(new Date(), -1)),
        }),
      },
      viewMonth: {
        title: (date: Date) => `${format(startOfMonth(date), 'MMMM yyyy', { locale: de })}`,
        value: (date: Date) => ({
          startDate: startOfMonth(date),
          endDate: endOfMonth(date),
        }),
      },
    },
  },
})

new Vue({
  render: h => h(Demo),
}).$mount('#app')
