import * as React from "react"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

import { cn } from "@/lib/utils"

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  separator?: React.ReactNode
  home?: boolean
  homeHref?: string
  homeIcon?: React.ReactNode
  homeLabel?: string
}

interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLLIElement> {
  href?: string
  current?: boolean
  icon?: React.ReactNode
  asChild?: boolean
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ 
    className, 
    separator = <ChevronRight className="h-4 w-4" />, 
    home = true, 
    homeHref = "/", 
    homeIcon = <Home className="h-4 w-4" />,
    homeLabel = "Home",
    children, 
    ...props 
  }, ref) => {
    return (
      <nav
        ref={ref}
        aria-label="breadcrumb"
        className={cn("flex", className)}
        {...props}
      >
        <ol className="flex items-center flex-wrap gap-1.5 text-sm" role="list">
          {home && (
            <li className="inline-flex items-center">
              <Link
                href={homeHref}
                className="inline-flex items-center text-muted-foreground hover:text-foreground"
                aria-label={homeLabel}
              >
                {homeIcon}
                <span className="sr-only">{homeLabel}</span>
              </Link>
            </li>
          )}
          {home && React.Children.count(children) > 0 && (
            <li className="inline-flex items-center text-muted-foreground" aria-hidden="true">
              {separator}
            </li>
          )}
          {React.Children.map(children, (child, index) => {
            if (!React.isValidElement(child)) return null
            
            const isLast = index === React.Children.count(children) - 1
            
            return (
              <React.Fragment key={index}>
                {child}
                {!isLast && (
                  <li className="inline-flex items-center text-muted-foreground" aria-hidden="true">
                    {separator}
                  </li>
                )}
              </React.Fragment>
            )
          })}
        </ol>
      </nav>
    )
  }
)
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, href, current = false, icon, asChild = false, children, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn("inline-flex items-center", className)}
        aria-current={current ? "page" : undefined}
        {...props}
      >
        {href && !current ? (
          <Link
            href={href}
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            {icon && <span className="mr-1">{icon}</span>}
            {children}
          </Link>
        ) : (
          <span className={cn("inline-flex items-center", current ? "font-medium text-foreground" : "text-muted-foreground")}>
            {icon && <span className="mr-1">{icon}</span>}
            {children}
          </span>
        )}
      </li>
    )
  }
)
BreadcrumbItem.displayName = "BreadcrumbItem"

export { Breadcrumb, BreadcrumbItem } 