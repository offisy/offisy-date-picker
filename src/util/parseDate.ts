import { getMonth, getYear, parse } from 'date-fns'

export function parseDate (input: string): false | Date {
  const raw = input.trim().split('.')

  let day = raw[0] || ''
  let month = raw[1] || ''
  let year = raw[2] || ''

  // Day
  if (day.length > 2) {
    month = `${day.slice(2)}${month}`
    day = day.slice(0, 2)
  }
  day = parseInt(day).toString()

  // Month
  switch (month.length) {
    case 0:
      month = getMonth(new Date()).toString()
      break
    case 1:
      month = month.padStart(1, '0')
      break
    default:
      year = `${month.slice(2)}${year}`
      month = month.slice(0, 2)
  }
  month = parseInt(month).toString()

  // Year
  if (year.length < 4) {
    year = year.padStart(4, getYear(new Date()).toString())
  }
  year = parseInt(year).toString()

  const parsed = parse(`${year}-${month}-${day}`, 'yyyy-MM-dd', new Date())

  if (isNaN(parsed.getTime())) {
    return false
  }

  return parsed
}
