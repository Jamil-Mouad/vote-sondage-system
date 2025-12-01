"use client"

import { useRef, useState, useEffect, type KeyboardEvent, type ClipboardEvent } from "react"
import { cn } from "@/lib/utils"

interface CodeInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: boolean
}

export function CodeInput({ length = 6, value, onChange, disabled = false, error = false }: CodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [focused, setFocused] = useState(0)

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return

    const newValue = value.split("")
    newValue[index] = char
    const result = newValue.join("").slice(0, length)
    onChange(result)

    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
      setFocused(index + 1)
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
        setFocused(index - 1)
      }
      const newValue = value.split("")
      newValue[index] = ""
      onChange(newValue.join(""))
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
      setFocused(index - 1)
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
      setFocused(index + 1)
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)
    onChange(pasteData)
    inputRefs.current[Math.min(pasteData.length, length - 1)]?.focus()
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => setFocused(index)}
          disabled={disabled}
          className={cn(
            "w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl border-2 transition-all",
            "bg-card text-card-foreground",
            focused === index && !error && "border-[var(--primary)] ring-4 ring-[var(--primary-100)]",
            error && "border-red-500 animate-shake",
            !error && focused !== index && "border-border",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        />
      ))}
    </div>
  )
}
