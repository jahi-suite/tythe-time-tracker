declare module 'luxon' {
  export class DateTime {
    static fromJSDate(date: Date, opts?: { zone?: string }): DateTime
    static fromObject(obj: Record<string, number>, opts?: { zone?: string }): DateTime
    setZone(zone: string, opts?: { keepLocalTime?: boolean }): DateTime
    toUTC(): DateTime
    toJSDate(): Date
    toFormat(fmt: string): string
    hour: number
  }
}
