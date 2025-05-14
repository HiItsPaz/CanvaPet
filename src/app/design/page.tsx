"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { 
  Code, 
  Palette, 
  Type, 
  Component, 
  Grid, 
  Accessibility, 
  ArrowRight 
} from "lucide-react"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  className?: string
}

function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}

interface CategoryCardProps {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  className?: string
}

function CategoryCard({ title, description, href, icon, className }: CategoryCardProps) {
  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Link href={href} className="w-full">
          <Button variant="outline" className="w-full justify-between" endIcon={<Icon icon={ArrowRight} size="sm" />}>
            Explore {title}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

export default function DesignPage() {
  return (
    <div className="space-y-12">
      <section className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl font-bold mb-4">CanvaPet Design System</h1>
        <p className="text-xl text-muted-foreground mb-8">
          A comprehensive library of reusable UI components, guidelines, and design principles
          for building consistent and accessible user interfaces.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/design/components">
            <Button size="lg" endIcon={<Icon icon={Component} size="sm" />}>
              Explore Components
            </Button>
          </Link>
          <Link href="https://github.com/your-org/canvapet" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" endIcon={<Icon icon={Code} size="sm" />}>
              View on GitHub
            </Button>
          </Link>
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold mb-6">Design Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <FeatureCard
            icon={<Icon icon={Palette} size="lg" className="text-blue-500" />}
            title="Consistent"
            description="All components follow the same design patterns, ensuring a cohesive user experience across the application."
          />
          <FeatureCard
            icon={<Icon icon={Accessibility} size="lg" className="text-violet-500" />}
            title="Accessible"
            description="Built with accessibility in mind, ensuring all users can interact with our interfaces regardless of ability."
          />
          <FeatureCard
            icon={<Icon icon={Grid} size="lg" className="text-emerald-500" />}
            title="Responsive"
            description="Designed to work across all device sizes, from mobile phones to large desktop screens."
          />
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold mb-6">Core Foundations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <CategoryCard
            icon={<Icon icon={Palette} size="lg" className="text-blue-500" />}
            title="Colors"
            description="Our color palette, including brand colors, semantic colors, and guidelines for usage."
            href="/design/colors"
          />
          <CategoryCard
            icon={<Icon icon={Type} size="lg" className="text-violet-500" />}
            title="Typography"
            description="Text styles, font families, sizes, and usage guidelines for consistency across interfaces."
            href="/design/typography"
          />
          <CategoryCard
            icon={<Icon icon={Code} size="lg" className="text-emerald-500" />}
            title="Icons"
            description="Our icon system, featuring a comprehensive set of Lucide icons with customization options."
            href="/design/icons"
          />
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold mb-6">Component Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <CategoryCard
            icon={<Icon icon={Component} size="lg" className="text-blue-500" />}
            title="Buttons"
            description="Interactive elements for triggering actions, with various styles, sizes, and states."
            href="/design/components/buttons"
          />
          <CategoryCard
            icon={<Icon icon={Grid} size="lg" className="text-violet-500" />}
            title="Cards"
            description="Flexible container components for grouping and displaying related content."
            href="/design/components/cards"
          />
          <CategoryCard
            icon={<Icon icon={Code} size="lg" className="text-emerald-500" />}
            title="Forms"
            description="Input components and controls for collecting user data and feedback."
            href="/design/components/forms"
          />
        </div>
        <div className="flex justify-center mt-8">
          <Link href="/design/components">
            <Button variant="outline" endIcon={<Icon icon={ArrowRight} size="sm" />}>
              View All Components
            </Button>
          </Link>
        </div>
      </section>
      
      <section className="bg-muted p-8 rounded-lg">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Getting Started with the Design System</h2>
          <p className="text-muted-foreground mb-6">
            Our design system provides reusable components and guidelines to help 
            you build consistent, accessible, and beautiful user interfaces.
          </p>
          <div className="text-left mb-6">
            <h3 className="text-lg font-semibold mb-2">Quick Start Guide</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Explore the <Link href="/design/components" className="text-primary hover:underline">component library</Link> to see available components</li>
              <li>Review <Link href="/design/colors" className="text-primary hover:underline">color</Link> and <Link href="/design/typography" className="text-primary hover:underline">typography</Link> guidelines for brand consistency</li>
              <li>Check the <Link href="/design/responsive" className="text-primary hover:underline">responsive design</Link> patterns for building adaptive UIs</li>
              <li>Use the <Link href="/design/accessibility" className="text-primary hover:underline">accessibility guidelines</Link> to ensure inclusive experiences</li>
            </ol>
          </div>
          <div className="flex gap-4 justify-center">
            <Link href="/design/components">
              <Button endIcon={<Icon icon={Component} size="sm" />}>
                Browse Components
              </Button>
            </Link>
            <Link href="/design/best-practices">
              <Button variant="outline" endIcon={<Icon icon={Code} size="sm" />}>
                Best Practices
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
} 