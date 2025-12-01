"use client"

import { useState, useEffect } from "react"

interface CountdownResult {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
  formatted: string
}

export function useCountdown(targetDate: string | Date): CountdownResult {
  const [countdown, setCountdown] = useState<CountdownResult>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    formatted: "",
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetDate).getTime()
      const now = Date.now()
      const difference = target - now

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          formatted: "Terminé",
        }
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      let formatted = ""
      if (days > 0) formatted += `${days}j `
      if (hours > 0 || days > 0) formatted += `${hours}h `
      formatted += `${minutes}m`
      if (days === 0 && hours === 0) formatted += ` ${seconds}s`

      return {
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
        formatted: formatted.trim(),
      }
    }

    setCountdown(calculateTimeLeft())

    const interval = setInterval(() => {
      setCountdown(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  return countdown
}
