import { DateRange, PluginOptions } from '@/lib'
import { addDays, addMonths, endOfMonth, startOfMonth } from 'date-fns'
import { enUS } from 'date-fns/locale'

interface Defaults {
  locale: Locale;
  okText: string;
  discardText: string;
  okClass: string | string[];
  discardClass: string | string[];
  presets: {
    range: {
      [key: string]: {
        title: ((date: Date | Date[] | DateRange | null) => string);
        value: ((date: Date | Date[] | DateRange | null) => DateRange);
      };
    };
    single: {
      [key: string]: {
        title: ((date: Date | Date[] | DateRange | null) => string);
        value: ((date: Date | Date[] | DateRange | null) => Date);
      };
    };
    multi: {
      [key: string]: {
        title: ((date: Date | Date[] | DateRange | null) => string);
        value: ((date: Date | Date[] | DateRange | null) => Date);
      };
    };
  };
}

const defaults: Defaults = {
  locale: enUS,
  okText: 'Ok',
  discardText: 'Cancel',
  okClass: 'ok-button',
  discardClass: 'discardClass',
  presets: {
    range: {
      today: {
        title: () => 'Today',
        value: () => ({ startDate: new Date(), endDate: new Date() }),
      },
      yesterday: {
        title: () => 'Yesterday',
        value: () => ({ startDate: addDays(new Date(), -1), endDate: addDays(new Date(), -1) }),
      },
      currentMonth: {
        title: () => 'Current Month',
        value: () => ({ startDate: startOfMonth(new Date()), endDate: endOfMonth(new Date()) }),
      },
      lastMonth: {
        title: () => 'Last Month',
        value: () => ({
          startDate: startOfMonth(addMonths(new Date(), -1)),
          endDate: endOfMonth(addMonths(new Date(), -1)),
        }),
      },
    },
    single: {},
    multi: {},
  },
}

export function setupDefaults (opts?: PluginOptions) {
  if (opts?.locale) defaults.locale = opts.locale
  if (opts?.okText) defaults.okText = opts.okText
  if (opts?.discardText) defaults.discardText = opts.discardText
  if (opts?.okClass) defaults.okClass = opts.okClass
  if (opts?.discardClass) defaults.discardClass = opts.discardClass
  if (opts?.presets) {
    if (opts.presets.single) defaults.presets.single = opts.presets.single
    if (opts.presets.multi) defaults.presets.multi = opts.presets.multi
    if (opts.presets.range) defaults.presets.range = opts.presets.range
  }

  return defaults
}

export default defaults
