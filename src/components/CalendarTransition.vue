<template>
  <div class="calendar-transition-wrapper">
    <transition :name="backwards ? 'calendar-transition-left' : 'calendar-transition-right'">
      <slot/>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class CalendarTransition extends Vue {
  @Prop({ type: Boolean }) backwards!: boolean;
}
</script>

<style lang="scss">

.calendar-transition-left, .calendar-transition-right {
  &-enter-active {
    transition: transform 0.3s ease-out, opacity 0.3s linear;
  }

  &-leave-active {
    transition: transform 0.3s ease-in, opacity 0.3s linear;
    position: absolute;
  }
}

.calendar-transition-right {
  &-leave, &-enter-to, {
    transform: translate(0, 0);
    opacity: 1;
  }

  &-enter {
    transform: translate(20px, 0);
    opacity: 0;
  }

  &-leave-to {
    transform: translate(-20px, 0);
    opacity: 0;
  }
}

.calendar-transition-left {
  &-leave, &-enter-to, {
    transform: translate(0, 0);
    opacity: 1;
  }

  &-enter {
    transform: translate(-20px, 0);
    opacity: 0;
  }

  &-leave-to {
    transform: translate(20px, 0);
    opacity: 0;
  }
}

.calendar-transition-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

</style>
