export default function generateArrayOfYears (min: number, max: number) {
  const years: number[] = []

  for (let i = max; i >= min; i--) {
    years.push(i)
  }
  return years.reverse()
}
