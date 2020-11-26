<template>
  <div class="date-picker" v-click-outside="closeModal">
    <div class="date-picker-input" ref="input">
      <slot :onInput="onTextInput" :open="openModal" :close="closeModal" :value="textValue">
        <input type="text" v-model="textValue" @change="onTextInput" @focus="openModal">
      </slot>
    </div>

    <div class="calendar-popover" v-show="popoverShowing" ref="popover">
      <calendar :calendar-width="calendarWidth" :calendar-height="calendarHeight" :type="type" :value="localValue"
                :month.sync="month" :year.sync="year" @input="localValue = $event">

        <template v-for="(_, name) of $scopedSlots" v-slot:[name]="scope">
          <slot :name="name" v-bind="scope"></slot>
        </template>
        <template #actions>
          <div class="actions-row">
            <slot :submit="submit" :discard="discard">
              <button :class="okClass" @click="submit">
                <slot name="ok-button-text">
                  Ok
                </slot>
              </button>
              <button :class="discardClass" @click="discard">
                <slot name="discard-button-text">
                  Cancel
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
})
export default class DatePicker extends Vue {
  textValue = ''

  @Prop() value!: Date | Date[] | DateRange | null;
  @Prop({ required: true, default: 'single' }) type!: CalendarType;

  @Prop({ default: 'ok-button' }) okClass!: string;
  @Prop({ default: 'discard-button' }) discardClass!: string;
  @Prop({ default: 256 }) calendarWidth!: number;
  @Prop({ default: 256 }) calendarHeight!: number;

  localValue: Date | Date[] | DateRange | null = null

  @Ref() input!: HTMLElement;
  @Ref() popover!: HTMLElement;
  private popper!: Instance;

  mounted () {
    this.localValue = this.value
    this.formatValue()

    this.$nextTick(() => {
      this.popper = createPopper(this.input, this.popover, {
        placement: 'bottom-start',
      })
    })
  }

  @Watch('value')
  onValueChanged () {
    this.localValue = this.value
    this.formatValue()
  }

  month = 0
  year = 0
  popoverShowing = false
  closeTimeout: number | NodeJS.Timeout | null = null

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
}

</script>

<style lang="scss" scoped>

$primary: #0aa699;
$danger: #f35958;

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
