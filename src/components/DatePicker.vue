<template>
  <div v-click-outside="closeModal" class="date-picker">
    <div ref="input" class="date-picker-input">
      <template v-if="!dualInputs">
        <slot v-bind:onChange="changeListener" v-bind:onInput="textInputListener" v-bind:open="openModalHandler"
              v-bind:value="textValue">
          <input v-model="textValue" type="text" @change="onTextInput" @focus="openModal">
        </slot>
      </template>
      <template v-else>
        <slot v-bind:onChange="changeListener" v-bind:open="openModalHandler" v-bind:value="textValue">
          <input v-model="textValue[0]" type="text" @change="onTextInput" @focus="openModal"/>
          &ndash;
          <input v-model="textValue[1]" @change="onTextInput" @focus="openModal"/>
        </slot>
      </template>
    </div>

    <div v-show="popoverShowing" ref="popover" class="calendar-popover">
      <calendar :calendar-height="calendarHeight" :calendar-width="calendarWidth" :max="max" :min="min"
                :month.sync="month" :type="type" :value="localValue" :year.sync="year" @input="localValue = $event">
        <template v-for="(_, name) of $scopedSlots" v-slot:[name]="scope">
          <slot v-bind="scope" :name="name"></slot>
        </template>
        <template #actions>
          <div class="actions-row">
            <slot :discard="discard" :submit="submit" name="actions-row">
              <button :class="okClass" type="button" @click="submit">
                <slot name="ok-button-text">
                   Übernehmen
                </slot>
              </button>
              <button :class="discardClass" type="button" @click="discard">
                <slot name="discard-button-text">
                  Abbrechen
                </slot>
              </button>
            </slot>
          </div>
        </template>
      </calendar>
    </div>
  </div>
</template>

<script lang="ts">

import { Component, Prop, Ref, Vue, Watch } from 'vue-property-decorator'
import { CalendarType, DateRange } from '@/lib'
import { format, parse } from 'date-fns'
import Calendar from '@/components/Calendar.vue'
import { createPopper, Instance } from '@popperjs/core'
import { ClickOutside } from '@/directives/ClickOutside'

@Component({
  components: { Calendar },
  directives: {
    'click-outside': ClickOutside,
  },
  filters: {
    date: format,
  },
})
export default class DatePicker extends Vue {
  textValue: string | string[] = ''

  @Prop() value!: Date | Date[] | DateRange | null;
  @Prop({ required: true, default: 'single' }) type!: CalendarType;

  @Prop({ default: 'ok-button' }) okClass!: string;
  @Prop({ default: 'discard-button' }) discardClass!: string;
  @Prop({ default: 256 }) calendarWidth!: number;
  @Prop({ default: 256 }) calendarHeight!: number;
  @Prop({ type: Boolean }) dualInputs!: boolean;

  @Prop({ type: Date }) min?: Date;
  @Prop({ type: Date }) max?: Date;

  localValue: Date | Date[] | DateRange | null = null

  @Ref() input!: HTMLElement;
  @Ref() popover!: HTMLElement;
  month = 0
  year = 0
  popoverShowing = false
  closeTimeout: number | NodeJS.Timeout | null = null
  private popper!: Instance;

  get openModalHandler () {
    console.log(this.openModal)
    return this.openModal
  }

  get textInputListener () {
    // eslint-disable-next-line no-return-assign
    return (value: string) => {
      this.textValue = value
    }
  }

  get changeListener () {
    return this.onTextInput
  }

  mounted () {
    this.localValue = this.value
    this.formatValue()
    this.$nextTick(() => {
      this.popper = createPopper(this.input, this.popover, {
        placement: 'bottom-start',
      })
    })
  }

  @Watch('value', { deep: true })
  onValueChanged () {
    this.localValue = this.value
    this.formatValue()
  }

  openModal () {
    let date = new Date()
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout as NodeJS.Timeout)
      this.closeTimeout = null
    }
    switch (this.type) {
      case 'single':
        if (this.value) date = this.value as Date
        break
      case 'range':
        if (this.value) date = (this.value as DateRange).startDate
        break
      case 'multi':
        if (this.value && (this.value as Date[]).length > 0) {
          date = (this.value as Date[])[0]
        }
    }

    this.month = date.getMonth()
    this.year = date.getFullYear()
    this.popoverShowing = true
    this.$nextTick(() => {
      this.popper.forceUpdate()
    })
  }

  closeModal () {
    this.closeTimeout = setTimeout(() => {
      this.closeTimeout = null
      this.popoverShowing = false
      this.localValue = this.value
      this.popper.forceUpdate()
    }, 50)
  }

  formatValue () {
    if (!this.value) {
      if (this.type === 'range' && this.dualInputs) this.textValue = ['', '']
      else this.textValue = ''
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
        if (this.dualInputs) {
          this.textValue = [format(range.startDate, 'dd.MM.yyyy'), format(range.endDate, 'dd.MM.yyyy')]
        } else {
          this.textValue = `${format(range.startDate, 'dd.MM.yyyy')} - ${format(range.endDate, 'dd.MM.yyyy')}`
        }
    }
  }

  onTextInput () {
    let value = this.textValue
    if (Array.isArray(value)) value = value.join(' - ')

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
        endDate = parse(parts[1].trim(), 'dd.MM.yyyy', new Date())

        if (isNaN(endDate.getTime())) endDate = parse(parts[1].trim(), 'ddMMyyyy', new Date())
        if (isNaN(startDate.getTime())) {
          startDate = endDate
        }
        if (isNaN(endDate.getTime())) {
          endDate = startDate
        }

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          this.formatValue()
        }

        if (startDate > endDate) {
          const tmp = startDate
          startDate = endDate
          endDate = tmp
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

    this.$nextTick(() => {
      let date = new Date()
      switch (this.type) {
        case 'single':
          if (this.value) date = this.value as Date
          break
        case 'range':
          if (this.value) date = (this.value as DateRange).startDate
          break
        case 'multi':
          if (this.value && (this.value as Date[]).length > 0) {
            date = (this.value as Date[])[0]
          }
      }

      this.month = date.getMonth()
      this.year = date.getFullYear()
    })
  }

  submit () {
    this.$emit('input', this.localValue)
    this.closeModal()
  }

  discard () {
    this.localValue = this.value
    this.closeModal()
  }

  beforeDestroy () {
    this.popper.destroy()
  }

  private clampValue (val: Date | Date[] | DateRange|null) {
    if (val === null) return null
    if (this.type === 'single') {
      let value = val
      if (this.min && value < this.min) value = this.min
      if (this.max && value > this.max) value = this.max
      return value
    } else if (this.type === 'multi') {
      return (val as Date[]).map(date => this.min && date < this.min ? this.min : (this.max && date > this.max ? this.max : date))
    } else if (this.type === 'range') {
      const value = { ...val as DateRange }
      if (this.min && value.startDate < this.min) value.startDate = this.min
      if (this.min && value.endDate < this.min) value.endDate = this.min
      if (this.max && value.startDate > this.max) value.startDate = this.max
      if (this.max && value.endDate > this.max) value.endDate = this.max
      return value
    }
    return null
  }
}

</script>

<style lang="scss" scoped>

@import '../style';

.calendar-popover {
  background-color: white;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.16);
  border-radius: 4px;

  width: auto;
  display: flex;
  flex-direction: column;

  z-index: 100;

  .actions-row {
    display: flex;
    justify-content: flex-end;

    button {
      &.ok-button, &.discard-button {
        border: none;
        border-radius: 4px;
        padding: 7px 15px;
        cursor: pointer;

        &:focus {
          outline: none;
        }
      }

      &.ok-button {
        background: $primary;
        color: white;
      }

      &.discard-button {
        background: $danger;
        color: white;
      }

      &:not(:first-child) {
        margin-left: 10px;
      }
    }
  }
}
</style>
