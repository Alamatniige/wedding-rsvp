import { Fragment, useEffect, useState } from 'react'
import { WEDDING_DATE, WEDDING_TIMEZONE } from '../../../lib/wedding-mode'

type TimeLeft = {
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

const ZERO: TimeLeft = {
  months: 0,
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
}

/** Start of WEDDING_DATE in Asia/Manila (UTC+8, no DST). */
export function getWeddingTargetMs(): number {
  return new Date(`${WEDDING_DATE}T00:00:00+08:00`).getTime()
}

function getTzParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: WEDDING_TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0)

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
  }
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function wallTimeToMs(parts: {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return new Date(
    `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}+08:00`,
  ).getTime()
}

function addCalendarMonths(
  parts: ReturnType<typeof getTzParts>,
  monthsToAdd: number,
) {
  let year = parts.year
  let month = parts.month + monthsToAdd
  while (month > 12) {
    month -= 12
    year += 1
  }
  while (month < 1) {
    month += 12
    year -= 1
  }
  const day = Math.min(parts.day, daysInMonth(year, month))
  return wallTimeToMs({
    year,
    month,
    day,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second,
  })
}

export function calcTimeLeft(targetMs: number, nowMs = Date.now()): TimeLeft {
  if (nowMs >= targetMs) return ZERO

  const nowParts = getTzParts(new Date(nowMs))
  let months = 0
  let cursorMs = nowMs
  let cursorParts = nowParts

  while (true) {
    const nextMs = addCalendarMonths(cursorParts, 1)
    if (nextMs > targetMs) break
    cursorMs = nextMs
    cursorParts = getTzParts(new Date(cursorMs))
    months += 1
  }

  let rem = targetMs - cursorMs
  const days = Math.floor(rem / (1000 * 60 * 60 * 24))
  rem %= 1000 * 60 * 60 * 24
  const hours = Math.floor(rem / (1000 * 60 * 60))
  rem %= 1000 * 60 * 60
  const minutes = Math.floor(rem / (1000 * 60))
  rem %= 1000 * 60
  const seconds = Math.floor(rem / 1000)

  return { months, days, hours, minutes, seconds }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export default function CountdownTimer() {
  const targetTime = getWeddingTargetMs()
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)

  useEffect(() => {
    setTimeLeft(calcTimeLeft(targetTime))
    const id = setInterval(() => {
      setTimeLeft(calcTimeLeft(targetTime))
    }, 1000)
    return () => clearInterval(id)
  }, [targetTime])

  const blocks = [
    { value: timeLeft ? pad(timeLeft.months) : '--', label: 'Months' },
    { value: timeLeft ? pad(timeLeft.days) : '--', label: 'Days' },
    { value: timeLeft ? pad(timeLeft.hours) : '--', label: 'Hours' },
    { value: timeLeft ? pad(timeLeft.minutes) : '--', label: 'Minutes' },
    { value: timeLeft ? pad(timeLeft.seconds) : '--', label: 'Seconds' },
  ]

  return (
    <div className="countdown" aria-live="polite">
      {blocks.map((block, index) => (
        <Fragment key={block.label}>
          {index > 0 && (
            <span className="countdown__separator" aria-hidden="true">
              :
            </span>
          )}
          <div className="countdown__block">
            <span className="countdown__value">{block.value}</span>
            <span className="countdown__label">{block.label}</span>
          </div>
        </Fragment>
      ))}
    </div>
  )
}
