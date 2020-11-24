
import './style.scss'
import './directives/ClickOutside'

export type CalendarType = 'single' | 'multi' | 'range'

export interface DateRange {
  startDate: Date;
  endDate: Date;
}
