<template>
  <div class="date-picker" v-click-outside="closeModal">
    <slot>
      <input type="text" v-model="textValue" @change="onTextInput" @focus="openModal">
    </slot>

    <div class="calendar-popover" v-if="popoverShowing">
      <calendar :type="type" :value="localValue" :month.sync="month" :year.sync="year" @input="$emit('input', $event)"/>
    </div>
  </div>
</template>

<script lang="ts">

import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { CalendarType, DateRange } from '@/lib'
import { format, parse } from 'date-fns'
import Calendar from '@/components/Calendar.vue'

@Component({
  components: { Calendar }
})
export default class DatePicker extends Vue {
  textValue = ''

  @Prop() value!: Date | Date[] | DateRange | null;
  @Prop({ required: true, default: 'single' }) type!: CalendarType;

  localValue: Date | Date[] | DateRange | null = null

  mounted () {
    this.localValue = this.value
    this.formatValue()
  }

  @Watch('value')
  onValueChanged () {
    this.localValue = this.value
    this.formatValue()
  }

  month = 0
  year = 0
  popoverShowing = false
  closeTimeout: number | null = null

  openModal () {
    let date = new Date()
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout)
      this.closeTimeout = null
    }
    switch (this.type) {
      case 'single':
        if (this.value) date = this.value as Date
    }

    this.month = date.getMonth()
    this.year = date.getFullYear()
    this.popoverShowing = true
  }

  closeModal () {
    this.closeTimeout = setTimeout(() => {
      this.closeTimeout = null
      this.popoverShowing = false
    }, 50)
  }

  formatValue () {
    if (!this.value) {
      this.textValue = ''
      return
    }
    switch (this.type) {
      case 'single':
        this.textValue = format(this.value as Date, 'dd.MM.yyyy')
        break
      case 'multi':
        this.textValue = (this.value as Date[]).map(date => format(date, 'dd.MM.yyyy')).join(', ')
        break
      case 'range':
        // eslint-disable-next-line no-case-declarations
        const range = this.value as DateRange
        this.textValue = `${format(range.startDate, 'dd.MM.yyyy')} - ${format(range.endDate, 'dd.MM.yyyy')}`
    }
  }

  onTextInput () {
    const value = this.textValue
    if (value.trim().length === 0) {
      this.$emit('input', null)
      return
    }

    let parts: string[]
    switch (this.type) {
      case 'single':

        parts = [value.replace(/[^0-9.]*/gm, '')]
        // eslint-disable-next-line no-case-declarations
        let date = parse(parts[0], 'dd.MM.yyyy', new Date())
        if (isNaN(date.getTime())) date = parse(parts[0], 'ddMMyyyy', new Date())
        if (isNaN(date.getTime())) {
          this.formatValue()
        } else {
          this.$emit('input', date)
        }
        break
      case 'range':
        // eslint-disable-next-line no-case-declarations
        parts = value.replace(/[^0-9.-]*/gm, '').split('-')
        if (parts.length !== 2) return this.formatValue()
        // eslint-disable-next-line no-case-declarations
        let [startDate, endDate] = [new Date(), new Date()]

        startDate = parse(parts[0].trim(), 'dd.MM.yyyy', new Date())
        if (isNaN(startDate.getTime())) startDate = parse(parts[0].trim(), 'ddMMyyyy', new Date())
        if (isNaN(startDate.getTime())) {
          this.textValue = ''
          return
        }

        endDate = parse(parts[1].trim(), 'dd.MM.yyyy', new Date())
        if (isNaN(endDate.getTime())) endDate = parse(parts[1].trim(), 'ddMMyyyy', new Date())
        if (isNaN(endDate.getTime())) {
          this.textValue = ''
          return
        }

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          this.formatValue()
        }

        this.$emit('input', { startDate, endDate })
        break
      case 'multi':
        parts = value.replace(/[^0-9.,]*/gm, '').split(',')

        // eslint-disable-next-line no-case-declarations
        let res = parts.map(part => part.trim()).map(part => {
          let date = parse(part, 'dd.MM.yyyy', new Date())
          if (isNaN(date.getTime())) date = parse(part, 'ddMMyyyy', new Date())
          if (isNaN(date.getTime())) {
            return undefined
          }
          return date
        })
        res = res.filter(res => res)
        if (res.length > 0) {
          this.$emit('input', res)
        } else {
          this.formatValue()
        }

        break
    }
  }
}

</script>

<style lang="scss" scoped>
.calendar-popover {
  background-color: white;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.16);
  border-radius: 4px;
  padding: 5px;
  width: 256px;
  height: 256px;
}
</style>
