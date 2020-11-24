import { PluginObject } from 'vue'
import DatePicker from '@/components/DatePicker.vue'
import { setupDefaults } from '@/util/defaults'

export type CalendarType = 'single' | 'multi' | 'range'

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface PluginOptions {
  locale?: Locale;
  okText?: string;
  discardText?: string;
  okClass?: string | string[];
  discardClass?: string | string[];
}

export const components = {
  DatePicker,
}

export const OffisyDatePicker: PluginObject<PluginOptions> = {
  install (Vue, opts?: PluginOptions) {
    const defaults = setupDefaults(opts)

    Vue.component('offisy-date-picker', DatePicker)
  },
}

export default OffisyDatePicker
