import { Fragment, useEffect, useState } from 'react'
import { couple } from '../../data/weddingData'

type TimeLeft = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calcTimeLeft(targetTime: number): TimeLeft {
  const diff = targetTime - Date.now()
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export default function CountdownTimer() {
  const targetTime = new Date(couple.weddingDateISO).getTime()
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)

  useEffect(() => {
    setTimeLeft(calcTimeLeft(targetTime))

    const id = setInterval(() => {
      setTimeLeft(calcTimeLeft(targetTime))
    }, 1000)
    return () => clearInterval(id)
  }, [targetTime])

  const blocks = [
    { value: timeLeft ? pad(timeLeft.days) : '--', label: 'Days' },
    { value: timeLeft ? pad(timeLeft.hours) : '--', label: 'Hours' },
    { value: timeLeft ? pad(timeLeft.minutes) : '--', label: 'Minutes' },
    { value: timeLeft ? pad(timeLeft.seconds) : '--', label: 'Seconds' },
  ]

  return (
    <div className="countdown">
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
