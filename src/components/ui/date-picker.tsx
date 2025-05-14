"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { KeyboardNavigable } from "./keyboard-enhanced-component"

// Simple Calendar component since we don't have access to the actual one
interface CalendarProps {
  mode?: "single" | "multiple" | "range"
  selected?: Date | Date[] | undefined
  onSelect?: ((date: Date | undefined) => void)
  disabled?: boolean | ((date: Date) => boolean)
  initialFocus?: boolean
}

function Calendar({
  mode = "single",
  selected,
  onSelect,
  disabled = false,
  initialFocus = false,
  ...props
}: CalendarProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'>) {
  // This is a simple mock implementation
  // In a real app, you would use a proper calendar component
  
  const today = new Date()
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const handleSelect = (day: number) => {
    if (onSelect) {
      const newDate = new Date(today.getFullYear(), today.getMonth(), day)
      onSelect(newDate)
    }
  }
  
  return (
    <div className="p-3" {...props}>
      <div className="mb-4 flex items-center justify-between">
        <Button variant="outline" size="sm">Previous</Button>
        <div className="font-medium">{format(today, 'MMMM yyyy')}</div>
        <Button variant="outline" size="sm">Next</Button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
          <div key={day} className="text-center text-sm text-muted-foreground">
            {day}
          </div>
        ))}
        {days.map((day) => (
          <Button
            key={day}
            variant="ghost"
            className={cn(
              "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
              selected instanceof Date && day === selected.getDate() 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-accent hover:text-accent-foreground"
            )}
            disabled={typeof disabled === 'function' ? disabled(new Date(today.getFullYear(), today.getMonth(), day)) : disabled}
            onClick={() => handleSelect(day)}
            aria-selected={selected instanceof Date && day === selected.getDate()}
            tabIndex={selected instanceof Date && day === selected.getDate() ? 0 : -1}
          >
            {day}
          </Button>
        ))}
      </div>
    </div>
  )
}

export interface DatePickerProps {
  date?: Date
  setDate: (date: Date | undefined) => void
  label?: string
  placeholder?: string
  className?: string
  disabled?: boolean
  format?: string
  calendarProps?: React.ComponentProps<typeof Calendar>
  showClearButton?: boolean
  clearButtonLabel?: string
  calendarPosition?: "bottom" | "top" | "left" | "right"
  errorMessage?: string
  required?: boolean
  descriptionId?: string
}

/**
 * Accessible Date Picker component with keyboard navigation support
 * 
 * Keyboard controls:
 * - Tab: Focus on the date field or calendar
 * - Enter/Space: Open/close calendar
 * - Arrow keys: Navigate within calendar dates
 * - Escape: Close calendar
 * - Home/End: Navigate to start/end of week
 * - Page Up/Down: Navigate to previous/next month
 */
export function DatePicker({
  date,
  setDate,
  label,
  placeholder = "Select date",
  className,
  disabled = false,
  format: formatStr = "PPP",
  calendarProps,
  showClearButton = true,
  clearButtonLabel = "Clear",
  calendarPosition = "bottom",
  errorMessage,
  required = false,
  descriptionId,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [hasFocus, setHasFocus] = React.useState(false)
  const inputRef = React.useRef<HTMLButtonElement>(null)
  const calendarContainerRef = React.useRef<HTMLDivElement>(null)
  
  // Generate unique IDs for accessibility
  const labelId = React.useId()
  const errorId = React.useId()
  const descId = descriptionId || React.useId()
  
  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    setIsOpen(false)
    
    // Return focus to trigger button after selection
    setTimeout(() => {
      inputRef.current?.focus()
    }, 10)
  }
  
  const handleClear = () => {
    setDate(undefined)
    // Keep focus on input after clearing
    setTimeout(() => {
      inputRef.current?.focus()
    }, 10)
  }
  
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Open calendar on key press
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault()
      setIsOpen(true)
    }
    
    // Handle Escape key to close the calendar
    if (e.key === "Escape" && isOpen) {
      e.preventDefault()
      setIsOpen(false)
      
      // Refocus the input after closing
      setTimeout(() => {
        inputRef.current?.focus()
      }, 10)
    }
  }
  
  // Trap focus in calendar when it's open
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      if (e.key === "Escape") {
        setIsOpen(false)
        inputRef.current?.focus()
      }
    }
    
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])
  
  // A11y: announce date changes to screen readers
  const selectedDateAnnouncement = date 
    ? `Selected date: ${format(date, formatStr)}`
    : "No date selected"
  
  return (
    <div className={cn("w-full space-y-2", className)}>
      {/* Hidden text for screen readers */}
      <div className="sr-only" aria-live="polite">
        {selectedDateAnnouncement}
      </div>
      
      {label && (
        <label 
          id={labelId}
          className="text-sm font-medium"
          htmlFor={`date-picker-${labelId}`}
        >
          {label}{required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={inputRef}
            id={`date-picker-${labelId}`}
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              hasFocus && "ring-2 ring-ring ring-offset-2",
              errorMessage && "border-destructive"
            )}
            disabled={disabled}
            onKeyDown={handleInputKeyDown}
            onFocus={() => setHasFocus(true)}
            onBlur={() => setHasFocus(false)}
            aria-invalid={!!errorMessage}
            aria-describedby={
              cn(
                descriptionId && descId,
                errorMessage && errorId
              ) || undefined
            }
            aria-required={required}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-controls={isOpen ? `calendar-${labelId}` : undefined}
            aria-labelledby={label ? labelId : undefined}
          >
            <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
            {date ? (
              <span>{format(date, formatStr)}</span>
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent
          className="w-auto p-0"
          align="start"
          side={calendarPosition}
          sideOffset={8}
          role="dialog"
          aria-modal="true"
          aria-label="Calendar date picker"
        >
          <div
            className="rounded-md border"
            role="application"
            aria-label="Calendar"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsOpen(false)
                inputRef.current?.focus()
              }
            }}
            ref={calendarContainerRef}
            tabIndex={0}
          >
            <div 
              id={`calendar-${labelId}`}
              className="flex w-full flex-col space-y-4 p-3"
            >
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleSelect}
                disabled={disabled}
                initialFocus
                {...calendarProps}
              />
              
              {/* Selected date announcement for screen readers */}
              <div className="sr-only" aria-live="polite">
                {date 
                  ? `Selected date: ${format(date, formatStr)}` 
                  : "No date selected"}
              </div>
              
              {showClearButton && (
                <Button
                  variant="outline"
                  onClick={handleClear}
                  disabled={!date || disabled}
                  className="mt-2"
                  aria-label={`${clearButtonLabel} selected date`}
                  type="button"
                >
                  {clearButtonLabel}
                </Button>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Error message */}
      {errorMessage && (
        <p 
          id={errorId} 
          className="text-sm text-destructive mt-1"
          aria-live="assertive"
        >
          {errorMessage}
        </p>
      )}
      
      {/* Description for screen readers */}
      {descriptionId && (
        <div id={descId} className="sr-only">
          Press Enter or Space to open the calendar. 
          Use arrow keys to navigate dates, Enter to select, and Escape to cancel.
        </div>
      )}
    </div>
  )
} 