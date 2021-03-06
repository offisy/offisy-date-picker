<template>
  <div
    class="calendar-day"
    :class="classes"
    @click="$emit('click', $event)"
    @mouseenter="$emit('mouseenter', $event)"
    @mouseleave="$emit('mouseleave', $event)"
  >
    <div class="calendar-day-backdrop"></div>
    <div class="calendar-day-text">
      {{ date | dayOfMonth }}
    </div>

  </div>
</template>

<script lang="ts">

import { Component, Prop, Vue } from 'vue-property-decorator'
import { getDate } from 'date-fns'

@Component({
  filters: {
    dayOfMonth (date: Date) {
      return getDate(date)
    },
  },
})
export default class CalendarDay extends Vue {
  @Prop({ required: true, type: Date }) date!: Date;
  @Prop() displayType!: 'selected' | null;
  @Prop({ type: Boolean }) outsideRange!: boolean;
  @Prop({ type: Boolean }) disabled!: boolean;

  get classes () {
    const classes = []
    if (this.displayType) classes.push(this.displayType)
    if (this.outsideRange) classes.push('outside-range')
    if (this.disabled) return ['outside-range', 'disabled']

    return classes
  }
}

</script>

<style lang="scss" scoped>
@import '../style';

.calendar-day {
  width: 100%;
  height: 100%;
  user-select: none;
  cursor: pointer;
  position: relative;

  >.calendar-day-text {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #333333;
  }

  &.outside-range>.calendar-day-text {
    color: transparentize(#333333, 0.65);
  }

  &.disabled {
    pointer-events: none;
  }

  &.selected, &.start, &.end {
    >.calendar-day-text {
      color: white;
      font-weight: bolder;
    }
  }
  &.between >.calendar-day-text{
    color: adjust-color($primary, $lightness: -15%, $saturation: -50%);
  }

  > .calendar-day-backdrop {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 5px;
    transition: all 0.35s ease;
  }

  &.between>.calendar-day-backdrop {
    background-color: $secondary-0-15;
    border-radius: 0;
  }

  &:hover>.calendar-day-backdrop {
    background-color: rgba(0,0,0,0.1);

  }

  &.start>.calendar-day-backdrop {
    background-color: $primary;
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
  }

  &.end>.calendar-day-backdrop {
    background-color: $primary;
    border-bottom-left-radius: 0;
    border-top-left-radius: 0;
  }

  &.selected>.calendar-day-backdrop {
    background-color: $primary;
  }

}
</style>
