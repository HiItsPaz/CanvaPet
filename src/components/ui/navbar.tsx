"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface NavbarProps extends React.HTMLAttributes<HTMLDivElement> {
  logo?: React.ReactNode
  logoHref?: string
  sticky?: boolean
  transparent?: boolean
  mobileBreakpoint?: "sm" | "md" | "lg"
  containerClassName?: string
  hideLogoOnMobile?: boolean
}

const Navbar = React.forwardRef<HTMLDivElement, NavbarProps>(
  ({ 
    className, 
    logo, 
    logoHref = "/", 
    sticky = false, 
    transparent = false,
    mobileBreakpoint = "md",
    containerClassName,
    hideLogoOnMobile = false,
    children, 
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const mobileBreakpointMap = {
      sm: "sm:hidden",
      md: "md:hidden",
      lg: "lg:hidden"
    }
    const desktopBreakpointMap = {
      sm: "hidden sm:flex",
      md: "hidden md:flex",
      lg: "hidden lg:flex"
    }
    
    const toggleMenu = () => setIsOpen(!isOpen)
    
    // Close mobile menu when switching to desktop view or when user clicks outside
    React.useEffect(() => {
      const handleResize = () => {
        const breakpoints = {
          sm: 640,
          md: 768,
          lg: 1024
        }
        
        if (window.innerWidth >= breakpoints[mobileBreakpoint]) {
          setIsOpen(false)
        }
      }
      
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false)
        }
      }
      
      window.addEventListener('resize', handleResize)
      document.addEventListener('keydown', handleEscape)
      
      return () => {
        window.removeEventListener('resize', handleResize)
        document.removeEventListener('keydown', handleEscape)
      }
    }, [mobileBreakpoint])
    
    return (
      <nav
        ref={ref}
        className={cn(
          "w-full z-30",
          sticky && "sticky top-0 left-0",
          transparent ? "bg-transparent" : "bg-background border-b",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "container mx-auto px-4 flex items-center justify-between h-16",
            containerClassName
          )}
        >
          {/* Logo */}
          <div className={cn(
            "flex-shrink-0",
            hideLogoOnMobile && `${mobileBreakpointMap[mobileBreakpoint].replace('hidden', 'invisible')}`
          )}>
            <Link href={logoHref} aria-label="Home">
              {logo || (
                <span className="text-lg font-semibold text-foreground">
                  Logo
                </span>
              )}
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className={cn(
            "items-center gap-2",
            desktopBreakpointMap[mobileBreakpoint]
          )}>
            {children}
          </div>
          
          {/* Mobile Menu Button */}
          <div className={cn(
            "flex items-center",
            desktopBreakpointMap[mobileBreakpoint]
          )}>
            {React.Children.toArray(children).filter(
              child => 
                React.isValidElement(child) && 
                child.type === NavbarAction
            )}
          </div>
          
          {/* Mobile Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            className={desktopBreakpointMap[mobileBreakpoint].replace("flex", "inline-flex")}
            onClick={toggleMenu}
          >
            {isOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        {/* Mobile Navigation */}
        {isOpen && (
          <div className={cn(
            "container mx-auto px-4 py-4 border-t bg-background",
            mobileBreakpointMap[mobileBreakpoint]
          )}>
            <div className="flex flex-col space-y-4">
              {children}
            </div>
          </div>
        )}
      </nav>
    )
  }
)
Navbar.displayName = "Navbar"

interface NavbarItemProps extends React.HTMLAttributes<HTMLDivElement> {
  href?: string
  active?: boolean
  mobileOnly?: boolean
  desktopOnly?: boolean
  mobileBreakpoint?: "sm" | "md" | "lg"
  onClick?: () => void
}

const NavbarItem = React.forwardRef<HTMLDivElement, NavbarItemProps>(
  ({ 
    className, 
    href, 
    active = false, 
    mobileOnly = false,
    desktopOnly = false,
    mobileBreakpoint = "md",
    onClick,
    children,
    ...props 
  }, ref) => {
    const mobileBreakpointMap = {
      sm: "sm:hidden",
      md: "md:hidden",
      lg: "lg:hidden"
    }
    const desktopBreakpointMap = {
      sm: "hidden sm:block",
      md: "hidden md:block",
      lg: "hidden lg:block"
    }
    
    const content = (
      <div
        ref={ref}
        className={cn(
          "flex items-center",
          mobileOnly && desktopBreakpointMap[mobileBreakpoint],
          desktopOnly && mobileBreakpointMap[mobileBreakpoint],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
    
    if (href) {
      return (
        <Link 
          href={href}
          onClick={onClick}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            active 
              ? "text-foreground" 
              : "text-muted-foreground",
          )}
          aria-current={active ? "page" : undefined}
        >
          {content}
        </Link>
      )
    }
    
    return content
  }
)
NavbarItem.displayName = "NavbarItem"

interface NavbarActionProps extends React.HTMLAttributes<HTMLDivElement> {
  mobileOnly?: boolean
  desktopOnly?: boolean
  mobileBreakpoint?: "sm" | "md" | "lg"
}

const NavbarAction = React.forwardRef<HTMLDivElement, NavbarActionProps>(
  ({ 
    className, 
    mobileOnly = false,
    desktopOnly = false,
    mobileBreakpoint = "md",
    children,
    ...props 
  }, ref) => {
    const mobileBreakpointMap = {
      sm: "sm:hidden",
      md: "md:hidden",
      lg: "lg:hidden"
    }
    const desktopBreakpointMap = {
      sm: "hidden sm:flex",
      md: "hidden md:flex",
      lg: "hidden lg:flex"
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center",
          mobileOnly && desktopBreakpointMap[mobileBreakpoint],
          desktopOnly && mobileBreakpointMap[mobileBreakpoint],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
NavbarAction.displayName = "NavbarAction"

export { Navbar, NavbarItem, NavbarAction } 