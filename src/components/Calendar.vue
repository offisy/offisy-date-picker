<template src="./Calendar.html"></template>

<script lang="ts">
import CalendarPane from '@/components/CalendarPane.vue'
import CalendarTransition from '@/components/CalendarTransition.vue'
import { CalendarType, DateRange, Pane } from '@/lib.ts'
import defaults from '@/util/defaults'
import { format, isSameDay } from 'date-fns'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { parseDate } from '@/util/parseDate'

@Component({
  components: {
    CalendarTransition,
    CalendarPane,
  },
})
/* eslint-disable */
export default class Calendar extends Vue {
  @Prop({ required: true }) type!: CalendarType
  @Prop() value!: Date | Date[] | DateRange | null

  @Prop({
    type: Number,
    required: true,
  }) year!: number

  @Prop({
    type: Number,
    required: true,
    validator: value => value >= 0 && value < 12,
  }) month!: number

  @Prop({ default: () => defaults.locale }) locale!: Locale
  @Prop() presets?: { [key: string]: { title: ((date: Date | Date[] | DateRange | null) => string); value: ((date: Date | Date[] | DateRange | null) => (Date | DateRange)) } }

  @Prop({ default: 512 }) calendarWidth!: number
  @Prop({ default: 256 }) calendarHeight!: number

  @Prop({ type: Date }) min?: Date
  @Prop({ type: Date }) max?: Date

  @Prop({ type: Boolean }) dualCalendarPane!: boolean

  selectionValue: Date | null = null
  hoveringValue: Date | null = null
  mode: 'selecting' | null = null
  textValue: string | string[] = ''

  panes: Pane[] = []

  @Prop({ type: String }) selectionType!: 'start' | 'end'

  mounted () {
    this.formatValue()

    this.panes = [{
      month: this.month,
      year: this.year,
    },
    ]
  }

  @Watch('value', { deep: true })
  onValueChanged () {
    this.formatValue()
  }

  formatValue () {
    if (!this.value) {
      if (this.isRangePicker) {
        this.textValue = ['', '']

        return
      }

      this.textValue = ''
      return
    }

    if (this.isRangePicker) {
      const range = this.value as DateRange
      this.textValue = [format(range.startDate, 'dd.MM.yyyy'), format(range.endDate, 'dd.MM.yyyy')]
    }
  }

  onTextInput () {
    if (this.isRangePicker) {
      let startDate = parseDate(this.textValue[0])
      let endDate = parseDate(this.textValue[1])

      if (!startDate) startDate = endDate
      if (!endDate) endDate = startDate

      if (startDate > endDate) {
        const tmp = startDate
        startDate = endDate
        endDate = tmp
      }

      this.formatValue()
      this.selectValue({
        startDate: startDate,
        endDate: endDate,
      })

      return
    }
  }

  onDayClicked (day: Date) {
    switch (this.type) {
      case 'single': {
        this.$emit('input', day)
        break
      }
      case 'multi': {
        const all = this.value as Date[] || []
        const filtered = all.filter(date => !isSameDay(date, day))
        if (filtered.length === all.length) {
          this.$emit('input', [...all, day])
        } else {
          this.$emit('input', filtered)
        }
        break
      }
      case 'range': {
        if (this.mode == null && this.selectionType !== 'end') {
          this.mode = 'selecting'
          this.selectionValue = day
        } else if (this.mode === 'selecting' || this.selectionType === 'end') {
          this.mode = null

          let a = this.selectionValue
          if (this.selectionType === 'end') {
            a = (this.value as DateRange).startDate
          }
          const b = this.hoveringValue
          if (a && b) {
            if (a < b) {
              this.$emit('input', {
                startDate: a,
                endDate: b,
              })
            } else {
              this.$emit('input', {
                startDate: b,
                endDate: a,
              })
            }
          }
        }
      }
    }
  }

  get datePresets () {
    const entries: { name: string; value: Date | DateRange; id: string }[] = []
    if (this.presets) {
      Object.keys(this.presets).forEach(key => entries.push({
        name: this.presets![key].title(this.currentViewDate),
        value: this.presets![key].value(this.currentViewDate),
        id: key,
      }))
    } else {
      Object.keys(defaults.presets[this.type]).forEach(key => entries.push({
        name: defaults.presets[this.type][key].title(this.currentViewDate),
        value: defaults.presets[this.type][key].value(this.currentViewDate),
        id: key,
      }))
    }

    return entries
  }

  get currentViewDate () {
    return new Date(this.year, this.month)
  }

  selectValue (value: Date | DateRange) {
    this.$emit('input', value)

    switch (this.type) {
      case 'single':
        this.$emit('update:month', (value as Date).getMonth())
        this.$emit('update:year', (value as Date).getFullYear())
        break
      case 'range':
        this.$emit('update:month', (value as DateRange).startDate.getMonth())
        this.$emit('update:year', (value as DateRange).startDate.getFullYear())
        break
    }
  }

  isPresetSelected (preset: Date | DateRange) {
    if (this.value === null) return false
    if (this.type === 'single') {
      return isSameDay((preset as Date), this.value as Date)
    }
    if (this.type === 'range') {
      const range = this.value as DateRange
      // console.log(range)
      // console.log(preset)
      //
      return isSameDay((preset as DateRange).startDate, range.startDate) && isSameDay((preset as DateRange).endDate, range.endDate)
    }
    return false
  }

  get isRangePicker () {
    return this.type === 'range'
  }
}

</script>

<style lang="scss" scoped>
@import '../style';

.calendar {
  height: 100%;
  display: flex;
  align-items: stretch;

  .calendar-side-pane {
    display: block;

    &:first-child {
      border-right: 1px solid $calendar-side-pane-border-color;
    }

    > ul {
      list-style: none;
      padding-left: 0;
      width: 10em;
      margin: 0;

      > li {
        text-align: left;
        padding: 0.5em 0.65em;
        cursor: pointer;
        user-select: none;
        color: $black;
        transition: all 0.35s ease;

        &.active {
          background-color: $primary;
          color: white;
        }

        &:hover:not(.active) {
          background-color: $secondary-0-15;
        }
      }
    }
  }

  .calendar-body {
    height: 100%;
    display: flex;
    padding: .25rem;
    flex-direction: column;

    .calendar-header-input {
      display: flex;
      align-items: center;
    }

    .calendar-panes {
      display: flex;

      .calendar-pane {
        .calendar-header-title {
          flex-grow: 1;
          width: 100%;
          height: 100%;
          text-align: center;
          display: flex;
          margin: 0;

          input {
            text-align: right;
            font-weight: 400;
            line-height: 1.5;
            border: 1px solid transparent;
            border-radius: 2px;
            box-shadow: none;
            transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
            width: inherit;
          }

          select {
            flex-grow: 3;
            padding: 0 0.5em;
          }

          > * {
            //flex-basis: 50%;
            flex-shrink: 1;
            flex-grow: 1;
            height: auto;
            border: none;
            font-size: 13px;

            &:focus {
              outline: 1px solid #ccc;
            }

            &:first-child {
              margin-right: 5px;
            }
          }
        }
      }
    }

  }

  .date-picker-input {
    width: 100%;
  }

  @media screen and (max-width: 500px) {
    flex-direction: column;

    .calendar-side-pane {
      width: 100%;
      border-right: none !important;
      border-bottom: 1px solid #ccc;

      ul {
        width: unset;
        margin: 0;
      }
    }
  }
}

.calendar-month-select {
  background-color: white;
}

</style>
