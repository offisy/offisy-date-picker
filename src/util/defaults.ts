import { DateRange, PluginOptions } from '@/lib'
import { enUS } from 'date-fns/locale'
import { addDays, addMonths, endOfMonth, startOfMonth } from 'date-fns'

interface Defaults {
  locale: Locale;
  okText: string;
  discardText: string;
  okClass: string | string[];
  discardClass: string | string[];
  presets: {
    range: {
      title: string;
      value: (() => DateRange);
    }[];
    single: {
      title: string;
      value: (() => Date);
    }[];
    multi: {
      title: string;
      value: (() => Date);
    }[];
  };
}

const defaults: Defaults = {
  locale: enUS,
  okText: 'Ok',
  discardText: 'Cancel',
  okClass: 'ok-button',
  discardClass: 'discardClass',
  presets: {
    range: [
      {
        title: 'Today',
        value: () => ({ startDate: new Date(), endDate: new Date() }),
      },
      {
        title: 'Yesterday',
        value: () => ({ startDate: addDays(new Date(), -1), endDate: addDays(new Date(), -1) }),
      },
      {
        title: 'Current Month',
        value: () => ({ startDate: startOfMonth(new Date()), endDate: endOfMonth(new Date()) }),
      },
      {
        title: 'Last Month',
        value: () => ({
          startDate: startOfMonth(addMonths(new Date(), -1)),
          endDate: endOfMonth(addMonths(new Date(), -1)),
        }),
      },
    ],
    single: [],
    multi: [],
  },
}

export function setupDefaults (opts?: PluginOptions) {
  if (opts?.locale) defaults.locale = opts.locale

  return defaults
}

export default defaults
