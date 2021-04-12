<template>
  <div class="calendar">
    <div class="calendar-side-pane" v-if="datePresets.length > 0">
      <ul>
        <li v-for="preset in datePresets" :key="preset.id" @click="selectValue(preset.value)"
            :class="{active: isPresetSelected(preset.value)}">
          {{ preset.name }}
        </li>
      </ul>
    </div>

    <div class="calendar-body" :style="{width: `${calendarWidth}px`, height: `${calendarHeight}px`}">
      <div class="calendar-header">
        <slot name="header" :addMonths="addMonths" :year="year" :month="month" :formattedMonth="formattedMonth">
          <button class="calendar-prev-button" @click="addMonths(-1)">
            <slot name="prev-button-text">
              <div class="calendar-prev-icon">
              </div>
            </slot>
          </button>
          <h4 class="calendar-header-title">
            <select class="calendar-month-select" :value="month"
                    @input="$emit('update:month', parseInt($event.target.value))">
              <option v-for="month in months" :value="month" :key="month">
                {{ month | monthName(locale) }}
              </option>
            </select>
            <input v-model="yearText" @change="$emit('update:year', parseInt(yearText))" type="number">
          </h4>
          <button class="calendar-next-button" @click="addMonths(1)">
            <slot name="next-button-text">
              <div class="calendar-next-icon">
              </div>
            </slot>
          </button>
        </slot>
      </div>

      <calendar-pane
          :month="month"
          :year="year"
          :type="type"
          :value="value"
          :locale="locale"
          :preview-range="selectionRange"
          :max="max"
          :min="min"
          @day-clicked="onDayClicked"
          @day-hovered="hoveringValue = $event"
      />
      <slot name="actions"/>
    </div>
  </div>
</template>

<script lang="ts">
import CalendarPane from '@/components/CalendarPane.vue'
import CalendarTransition from '@/components/CalendarTransition.vue'
import { CalendarType, DateRange } from '@/lib.ts'
import defaults from '@/util/defaults'
import { format, isSameDay, setMonth } from 'date-fns'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

@Component({
  components: {
    CalendarTransition,
    CalendarPane,
  },
  filters: {

    monthName (month: number, locale: Locale) {
      const date = setMonth(new Date(), month)
      return format(date, 'MMMM', { locale })
    },
  },
})
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
  @Prop() presets?: { [key: string]: { title: string; value: (() => (Date | DateRange)) } }

  @Prop({ default: 256 }) calendarWidth!: number
  @Prop({ default: 256 }) calendarHeight!: number

  @Prop({ type: Date }) min?: Date
  @Prop({ type: Date }) max?: Date

  selectionValue: Date | null = null
  hoveringValue: Date | null = null
  mode: 'selecting' | null = null

  yearText = ''

  @Prop({ type: String }) selectionType!: 'start' | 'end'

  @Watch('year')
  updateYearText () {
    this.yearText = this.year.toString()
  }

  mounted () {
    this.updateYearText()
  }

  get selectionRange (): DateRange | null {
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

  onDayClicked (day: Date) {
    if (this.type === 'single') {
      this.$emit('input', day)
    } else if (this.type === 'multi') {
      const all = this.value as Date[] || []
      const filtered = all.filter(date => !isSameDay(date, day))
      if (filtered.length === all.length) {
        this.$emit('input', [...all, day])
      } else {
        this.$emit('input', filtered)
      }
    } else if (this.type === 'range') {
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

  get formattedMonth () {
    const date = new Date(this.year, this.month)
    return format(date, 'MMMM', { locale: this.locale })
  }

  addMonths (months: number) {
    let month = this.month
    let year = this.year

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

    this.$emit('update:month', month)
    this.$emit('update:year', year)
  }

  get datePresets () {
    const entries: { name: string; value: Date | DateRange; id: string }[] = []
    if (this.presets) {
      Object.keys(this.presets).forEach(key => entries.push({
        name: this.presets![key].title,
        value: this.presets![key].value(),
        id: key,
      }))
    } else {
      Object.keys(defaults.presets[this.type]).forEach(key => entries.push({
        name: defaults.presets[this.type][key].title,
        value: defaults.presets[this.type][key].value(),
        id: key,
      }))
    }
    return entries
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

  isPresetSelected (value: Date | DateRange) {
    if (this.value === null) return false
    if (this.type === 'single') {
      return isSameDay((value as Date), this.value as Date)
    }
    if (this.type === 'range') {
      const range = this.value as DateRange
      return isSameDay((value as DateRange).startDate, range.startDate) && isSameDay((value as DateRange).endDate, range.endDate)
    }
    return false
  }

  get months () {
    return Array.from(new Array(12).keys())
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

    .calendar-header {
      display: flex;
      align-items: center;

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
        left: 0.25em;
        transform: rotate(-135deg);
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
