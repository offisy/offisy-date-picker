<template src="./CalendarPane.html"></template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import {
  add,
  addDays,
  format,
  getMonth,
  getWeeksInMonth,
  isSameDay,
  isWithinInterval,
  setMonth,
  startOfDay,
  startOfWeek,
} from 'date-fns'
import CalendarDay from '@/components/CalendarDay.vue'
import { CalendarType, DateRange } from '@/lib'
import generateArrayOfYears from '@/util/date'

@Component({
  components: { CalendarDay },
  filters: {
    monthName (month: number, locale: Locale) {
      const date = setMonth(new Date(), month)
      return format(date, 'MMMM', { locale })
    },
  },
})
/* eslint-disable */
export default class CalendarPane extends Vue {
  @Prop({
    type: Number,
    required: true,
    validator: value => value >= 0 && value < 12,
  }) month!: number
  localMonth: number = 1

  @Prop({
    type: Number,
    required: true,
  }) year!: number

  localYear: number = 0

  @Prop({ required: true }) type!: CalendarType
  @Prop({}) locale!: Locale

  @Prop({ type: Date }) min?: Date
  @Prop({ type: Date }) max?: Date

  @Prop() value!: Date | Date[] | DateRange | null
  @Prop() selectionValue: Date | null = null
  @Prop() hoveringValue: Date | null = null
  @Prop({ type: String }) selectionType!: 'start' | 'end'
  @Prop() mode: 'selecting' | null = null

  mounted () {
    this.setMonthYear()
  }

  getDisplayType (date: Date): 'selected' | 'start' | 'end' | 'between' | null {
    let value = this.value
    if (this.datesRange !== null) {
      value = this.datesRange
    } else if (this.value === null) return null

    switch (this.type) {
      case 'single':
        if (isSameDay(date, value as Date)) {
          return 'selected'
        }
        break
      case 'multi':
        if ((value as Date[]).some(selection => isSameDay(date, selection))) {
          return 'selected'
        }
        break
      case 'range':

        if (isSameDay(date, (value as DateRange).startDate)) {
          if (isSameDay((value as DateRange).startDate, (value as DateRange).endDate)) {
            return 'selected'
          }

          return 'start'
        }
        if (isSameDay(date, (value as DateRange).endDate)) {
          return 'end'
        }
        if (isWithinInterval(date, {
          start: (value as DateRange).startDate,
          end: (value as DateRange).endDate,
        })) {
          return 'between'
        }
    }
    return null
  }

  isOutsideMonth (date: Date) {
    return getMonth(date) !== this.localMonth
  }

  weekDayName (date: Date) {
    return format(date, 'EEEEEE', { locale: this.locale })
  }

  isDisabled (day: Date) {
    day = startOfDay(day)
    if (this.min && day < startOfDay(this.min)) {
      return true
    }

    if (this.max && day > startOfDay(this.max)) {
      return true
    }

    return false
  }

  addMonths (months: number) {
    let month = this.localMonth
    let year = this.localYear

    if (months < 0) {
      month += months
      while (month < 0) {
        month += 12
        year -= 1
      }
    }
    if (months > 0) {
      month += months
      while (month > 11) {
        month -= 12
        year += 1
      }
    }

    const date = new Date(this.year, this.month)
    if (this.max && date > this.max) {
      this.localMonth = this.max.getMonth()
      this.localYear = this.max.getFullYear()
      return
    }

    if (this.min && date < this.min) {
      this.localMonth = this.min.getMonth()
      this.localYear = this.min.getFullYear()
      return
    }

    this.localMonth = month
    this.localYear = year

    // this.$emit('update:month', month)
    // this.$emit('update:year', year)
  }

  get formattedMonth () {
    const date = new Date(this.year, this.month)
    return format(date, 'MMMM', { locale: this.locale })
  }

  get days (): Date[] {
    const date = new Date(this.localYear, this.localMonth)
    const weekCount = getWeeksInMonth(date, { weekStartsOn: 1 })

    let curDate = startOfWeek(date, { weekStartsOn: 1 })
    const dates: Date[] = []

    for (let i = 0; i < weekCount; i++) {
      for (let weekday = 0; weekday < 7; weekday++) {
        dates.push(curDate)
        curDate = addDays(curDate, 1)
      }
    }

    return dates
  }

  get months () {
    return Array.from(new Array(12).keys())
  }

  get years () {
    const min = this.min || new Date('2000')
    const max = this.max || add(new Date(), { years: 10})

    return generateArrayOfYears(min.getFullYear(), max.getFullYear())
  }

  get datesRange (): DateRange | null {
    const value = this.value as DateRange | undefined

    if (this.selectionType === 'end' && value?.startDate && this.hoveringValue) {
      if (value.startDate < this.hoveringValue) {
        return {
          startDate: value.startDate,
          endDate: this.hoveringValue,
        }
      } else {
        return {
          startDate: this.hoveringValue,
          endDate: value.startDate,
        }
      }
    } else if (this.mode === 'selecting' && this.selectionValue && this.hoveringValue) {
      if (this.selectionValue < this.hoveringValue) {
        return {
          startDate: this.selectionValue,
          endDate: this.hoveringValue,
        }
      } else {
        return {
          startDate: this.hoveringValue,
          endDate: this.selectionValue,
        }
      }
    }
    return null
  }

  setMonthYear () {
    const value = this.value
    if (!value) {
      this.localMonth = (new Date()).getMonth()
      this.localYear = (new Date()).getFullYear()
      return
    }

    switch (this.type) {
      case 'single':
        this.localMonth = (value as Date).getMonth()
        this.localYear = (value as Date).getFullYear()
        break
      case 'range':
        this.localMonth = (value as DateRange).startDate.getMonth()
        this.localYear = (value as DateRange).startDate.getFullYear()
        break
    }
  }
}

</script>

<style lang="scss" scoped>

$primary: #0aa699;

.calendar-pane {
  display: block;
  width: 100%;
  height: 100%;

  .calendar-menu {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .calendar-header-title {
      margin: 0.5em;
    }

    .calendar-prev-button, .calendar-next-button {
      flex-grow: 0;
      border: none;
      width: 4em;
      height: 2.5em;
      display: block;
      background: none;
      cursor: pointer;
      border-radius: 4px;
      font-weight: bold;

      &:hover {
        background: rgba(0, 0, 0, 0.1);;
      }

      &:focus {
        outline: none
      }
    }

    .calendar-prev-button {
      margin-right: 1em;

      .calendar-prev-icon::after {
        font-size: 18px;
        border-style: solid;
        border-width: 0.25em 0.25em 0 0;
        content: '';
        display: inline-block;
        height: 0.25em;
        position: relative;
        top: 0.15em;
        vertical-align: top;
        width: 0.25em;
        left: 0.15em;
        transform: rotate(-135deg);
      }
    }

    .calendar-next-icon::after {
      font-size: 18px;
      border-style: solid;
      border-width: 0.25em 0.25em 0 0;
      content: '';
      display: inline-block;
      height: 0.25em;
      position: relative;
      top: 0.15em;
      vertical-align: top;
      width: 0.25em;
      left: 0.0em;
      transform: rotate(45deg);
    }
  }

  .days-wrapper {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-template-rows: repeat(7, 1fr);
    width: 100%;
    height: 100%;

    .day {
      padding: 3px;
    }
  }

  .weekday-name {
    color: $primary;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
  }
}
</style>
