<template>
  <div class="calendar">
    <div class="calendar-body">
      <div class="calendar-header">
        <slot name="header">
          <button class="calendar-prev-button" @click="addMonths(-1)">
            &lt;
          </button>

          <h4 class="calendar-header-title">
            {{ formattedMonth }} {{ year }}
          </h4>

          <button class="calendar-next-button" @click="addMonths(1)">
            &gt;
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
        @day-clicked="onDayClicked"
        @day-hovered="hoveringValue = $event"
      />
    </div>
  </div>
</template>

<script lang="ts">
import CalendarPane from '@/components/CalendarPane.vue'
import { Prop, Component, Vue } from 'vue-property-decorator'
import { CalendarType, DateRange } from '@/lib.ts'
import { format, isSameDay } from 'date-fns'
import { de } from 'date-fns/locale'
import CalendarTransition from '@/components/CalendarTransition.vue'

@Component({
  components: { CalendarTransition, CalendarPane }
})
export default class Calendar extends Vue {
  @Prop({ required: true }) type!: CalendarType;
  @Prop() value!: Date | Date[] | DateRange | null

  @Prop({ type: Number, required: true }) year!: number;
  @Prop({ type: Number, required: true, validator: value => value >= 0 && value < 12 }) month!: number;

  @Prop() locale?: Locale;

  selectionValue: Date | null = null
  hoveringValue: Date | null = null
  mode: 'selecting' | null = null
  swipeLeft = false

  get selectionRange (): DateRange | null {
    if (this.mode === 'selecting' && this.selectionValue && this.hoveringValue) {
      if (this.selectionValue < this.hoveringValue) {
        return {
          startDate: this.selectionValue,
          endDate: this.hoveringValue
        }
      } else {
        return {
          startDate: this.hoveringValue,
          endDate: this.selectionValue
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
      if (this.mode == null) {
        this.mode = 'selecting'
        this.selectionValue = day
      } else if (this.mode === 'selecting') {
        this.mode = null
        const a = this.selectionValue
        const b = this.hoveringValue
        if (a && b) {
          if (a < b) {
            this.$emit('input', { startDate: a, endDate: b })
          } else {
            this.$emit('input', { startDate: b, endDate: a })
          }
        }
      }
    }
  }

  get formattedMonth () {
    const date = new Date(this.year, this.month)
    return format(date, 'MMMM', { locale: this.locale || de })
  }

  addMonths (months: number) {
    let month = this.month
    let year = this.year

    console.log('addMonths: ', months)

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
}

</script>

<style lang="scss" scoped>

$primary: #0aa699;

.calendar {
  width: 100%;
  height: 100%;
  display: flex;

  .calendar-side-pane {
    > ul {
      list-style: none;
      padding-left: 0;

      > li {
        text-align: left;
      }
    }
  }

  .calendar-header {
    display: flex;
    align-items: center;

    .calendar-prev-button, .calendar-next-button {
      flex-grow: 0;
      border: none;
      width: 4em;
      height: 3em;
      display: block;
      background: none;
      cursor: pointer;
      border-radius: 4px;
      color: #333;
      font-weight: bold;

      &:hover {
        background: rgba(0, 0, 0, 0.1);;
      }

      &:focus {
        outline: none
      }
    }

    .calendar-header-title {
      flex-grow: 1;
      width: 100%;
    }
  }

  .calendar-body {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}

</style>
