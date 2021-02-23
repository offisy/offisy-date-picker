<template>
  <div class="calendar-pane">
    <div class="days-wrapper">
      <div v-for="day in [0,1,2,3,4,5,6]" :key="'weekday-' + day" class="weekday-name">
        {{ weekDayName(days[day]) }}
      </div>
      <calendar-day v-for="(day, index) in days" :key="index"
                    :date="day"
                    :disabled="isDisabled(day)"
                    :display-type="getDisplayType(day)"
                    :outside-range="isOutsideMonth(day)"
                    @click="$emit('day-clicked', day, $event)"
                    @mouseenter="$emit('day-hovered', day)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import {
  addDays,
  format,
  getMonth,
  getWeeksInMonth,
  isSameDay,
  isWithinInterval,
  startOfDay,
  startOfWeek,
} from 'date-fns'
import CalendarDay from '@/components/CalendarDay.vue'
import { CalendarType, DateRange } from '@/lib'

@Component({
  components: { CalendarDay },
  filters: {},
})
export default class CalendarPane extends Vue {
  @Prop({ type: Number, required: true }) year!: number;
  @Prop({ type: Number, required: true, validator: value => value >= 0 && value < 12 }) month!: number;
  @Prop({ required: true }) type!: CalendarType;
  @Prop() previewRange!: DateRange | null;
  @Prop({}) locale!: Locale;

  @Prop({ type: Date }) min?: Date;
  @Prop({ type: Date }) max?: Date;

  @Prop() value!: Date | Date[] | DateRange | null

  get days (): Date[] {
    const date = new Date(this.year, this.month)
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

  getDisplayType (date: Date): 'selected' | 'start' | 'end' | 'between' | null {
    let value = this.value
    if (this.previewRange !== null) {
      value = this.previewRange
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
    return getMonth(date) !== this.month
  }

  weekDayName (date: Date) {
    return format(date, 'EEEEEE', { locale: this.locale })
  }

  isDisabled (day: Date) {
    day = startOfDay(day)
    if (this.min && day < startOfDay(this.min)) {
      return true
    } else if (this.max && day > startOfDay(this.max)) {
      return true
    }
    return false
  }
}

</script>

<style lang="scss" scoped>

$primary: #0aa699;

.calendar-pane {
  display: block;
  width: 100%;
  height: 100%;

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
