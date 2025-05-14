"use client"

import * as React from "react"
import { 
  ChevronLeft, 
  ChevronRight, 
  Circle,
  CircleDot
} from "lucide-react"
import { cn } from "@/lib/utils"
import { KeyboardNavigableCarousel } from "./keyboard-enhanced-component"
import { Button } from "./button"

interface CarouselProps {
  children: React.ReactNode[]
  className?: string
  showArrows?: boolean
  showDots?: boolean
  autoplay?: boolean
  autoplayInterval?: number
  loop?: boolean
  ariaLabel?: string
  slideClassName?: string
  disableKeyboardNavigation?: boolean
}

/**
 * Accessible Carousel component with keyboard navigation
 * 
 * Keyboard controls:
 * - Left/Right arrows: Navigate between slides
 * - Home: Go to first slide
 * - End: Go to last slide
 * - Space/Enter: Pause/resume autoplay
 */
export function Carousel({
  children,
  className,
  showArrows = true,
  showDots = true,
  autoplay = false,
  autoplayInterval = 5000,
  loop = true,
  ariaLabel = "Image carousel",
  slideClassName,
  disableKeyboardNavigation = false,
}: CarouselProps) {
  const [currentSlide, setCurrentSlide] = React.useState(0)
  const [isPaused, setIsPaused] = React.useState(false)
  const totalSlides = React.Children.count(children)
  const autoplayTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  
  // Focus management
  const containerRef = React.useRef<HTMLDivElement>(null)
  
  // Handle next slide
  const nextSlide = React.useCallback(() => {
    if (currentSlide >= totalSlides - 1) {
      if (loop) setCurrentSlide(0)
    } else {
      setCurrentSlide(currentSlide + 1)
    }
  }, [currentSlide, totalSlides, loop])
  
  // Handle previous slide
  const prevSlide = React.useCallback(() => {
    if (currentSlide <= 0) {
      if (loop) setCurrentSlide(totalSlides - 1)
    } else {
      setCurrentSlide(currentSlide - 1)
    }
  }, [currentSlide, totalSlides, loop])
  
  // Go to specific slide
  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    
    // If using keyboard navigation, move focus to the slide
    if (containerRef.current) {
      containerRef.current.focus()
    }
  }
  
  // Pause/resume autoplay
  const toggleAutoplay = () => {
    setIsPaused(!isPaused)
  }
  
  // Set up autoplay
  React.useEffect(() => {
    if (autoplay && !isPaused) {
      autoplayTimerRef.current = setTimeout(() => {
        nextSlide()
      }, autoplayInterval)
    }
    
    return () => {
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current)
      }
    }
  }, [autoplay, isPaused, autoplayInterval, currentSlide, nextSlide])
  
  // Convert React children to array
  const slides = React.Children.toArray(children)
  
  // Keyboard navigation handlers
  const handleSelect = () => {
    toggleAutoplay()
  }
  
  // Custom key handlers
  const customKeyHandlers = {
    ' ': toggleAutoplay, // Space key
  }
  
  // Move focus into carousel on render
  React.useEffect(() => {
    if (containerRef.current && !disableKeyboardNavigation) {
      containerRef.current.focus()
    }
  }, [disableKeyboardNavigation])

  return (
    <div 
      ref={containerRef}
      className={cn("relative w-full overflow-hidden", className)}
      tabIndex={disableKeyboardNavigation ? -1 : 0}
      aria-roledescription="carousel"
      aria-label={ariaLabel}
    >
      <div className="sr-only">
        Carousel with {totalSlides} slides. 
        {!disableKeyboardNavigation && "Use left and right arrow keys to navigate between slides."}
        {autoplay && `Carousel is ${isPaused ? 'paused' : 'playing'}. Press Space to ${isPaused ? 'resume' : 'pause'}.`}
      </div>
      
      {disableKeyboardNavigation ? (
        <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {slides.map((slide, index) => (
            <div 
              key={index}
              className={cn("flex-shrink-0 flex-grow-0 w-full", slideClassName)}
              aria-hidden={index !== currentSlide}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1} of ${totalSlides}`}
            >
              {slide}
            </div>
          ))}
        </div>
      ) : (
        <KeyboardNavigableCarousel
          currentSlide={currentSlide}
          setCurrentSlide={setCurrentSlide}
          slideCount={totalSlides}
          onNext={nextSlide}
          onPrevious={prevSlide}
          onSelect={handleSelect}
          disabled={false}
          ariaLabel={ariaLabel}
          className="outline-none"
        >
          <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {slides.map((slide, index) => (
              <div 
                key={index}
                className={cn("flex-shrink-0 flex-grow-0 w-full", slideClassName)}
                aria-hidden={index !== currentSlide}
                role="group"
                aria-roledescription="slide"
                aria-label={`Slide ${index + 1} of ${totalSlides}`}
              >
                {slide}
              </div>
            ))}
          </div>
        </KeyboardNavigableCarousel>
      )}
      
      {/* Navigation arrows */}
      {showArrows && (
        <>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-background/80 p-0 opacity-70 shadow-sm backdrop-blur-sm transition-opacity hover:opacity-100 focus:opacity-100",
              !loop && currentSlide === 0 && "hidden" // Hide if at first slide and not looping
            )}
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-background/80 p-0 opacity-70 shadow-sm backdrop-blur-sm transition-opacity hover:opacity-100 focus:opacity-100",
              !loop && currentSlide === totalSlides - 1 && "hidden" // Hide if at last slide and not looping
            )}
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}
      
      {/* Slide indicator dots */}
      {showDots && (
        <div
          className="absolute bottom-2 flex w-full justify-center gap-1"
          role="tablist"
          aria-label="Carousel navigation"
        >
          {slides.map((_, index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 cursor-pointer rounded-full p-0",
                index === currentSlide
                  ? "text-primary"
                  : "text-muted-foreground/30 hover:text-muted-foreground"
              )}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-selected={index === currentSlide}
              role="tab"
            >
              {index === currentSlide ? (
                <CircleDot className="h-3 w-3" />
              ) : (
                <Circle className="h-3 w-3" />
              )}
            </Button>
          ))}
        </div>
      )}
      
      {/* Autoplay indicator (for screen readers) */}
      {autoplay && (
        <div className="sr-only" aria-live="polite">
          {isPaused ? "Carousel paused" : "Carousel playing"}
        </div>
      )}
    </div>
  )
} 