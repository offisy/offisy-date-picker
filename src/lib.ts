import DatePicker from '@/components/DatePicker.vue'
import { setupDefaults } from '@/util/defaults'
import { PluginObject } from 'vue'

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
  presets?: {
    range?: {
      [key: string]: {
        title: string;
        value: (() => DateRange);
      };
    };
    single?: {
      [key: string]: {
        title: string;
        value: (() => Date);
      };
    };
    multi?: {
      [key: string]: {
        title: string;
        value: (() => Date);
      };
    };
  };
}

export const components = {
  DatePicker,
}

export const OffisyDatePicker: PluginObject<PluginOptions> = {
  install (Vue, opts?: PluginOptions) {
    setupDefaults(opts)
    Vue.component('offisy-date-picker', DatePicker)
  },
}

export default OffisyDatePicker
