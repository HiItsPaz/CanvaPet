"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface ComponentExampleProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function ComponentExample({ title, description, children, className }: ComponentExampleProps) {
  return (
    <Card className={cn("mb-8", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

interface CodeBlockProps {
  language?: "tsx" | "jsx" | "html" | "css" | "bash" | "json"
  code: string
  filename?: string
  className?: string
}

export function CodeBlock({ language = "tsx", code, filename, className }: CodeBlockProps) {
  return (
    <div className={cn("bg-muted rounded-md", className)}>
      {filename && (
        <div className="border-b px-4 py-2 text-xs font-medium text-muted-foreground">
          {filename}
        </div>
      )}
      <pre className={cn("p-4 text-sm overflow-auto", `language-${language}`)}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

interface ComponentDocsProps {
  title: string
  description: string
  componentName: string
  apiReference?: React.ReactNode
  usage?: React.ReactNode
  children?: React.ReactNode
  accessibility?: React.ReactNode
  examples?: React.ReactNode
  className?: string
}

export function ComponentDocs({
  title,
  description,
  componentName,
  apiReference,
  usage,
  accessibility,
  examples,
  children,
  className,
}: ComponentDocsProps) {
  return (
    <div className={cn("space-y-8", className)}>
      <div>
        <h1 className="text-3xl font-bold mb-3">{title}</h1>
        <p className="text-muted-foreground text-lg">{description}</p>
      </div>
      
      {children}
      
      <Tabs defaultValue="examples" className="mt-8">
        <TabsList>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="api">API Reference</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
        </TabsList>
        
        <TabsContent value="examples" className="py-4 space-y-6">
          {examples ? (
            examples
          ) : (
            <div className="text-muted-foreground">No examples provided.</div>
          )}
        </TabsContent>
        
        <TabsContent value="usage" className="py-4 space-y-6">
          {usage ? (
            usage
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Import</h3>
              <CodeBlock
                language="tsx"
                code={`import { ${componentName} } from "@/components/ui/${componentName.toLowerCase()}"`}
              />
              <p className="text-muted-foreground">
                For more detailed usage instructions, please refer to the documentation.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="api" className="py-4 space-y-6">
          {apiReference ? (
            apiReference
          ) : (
            <div className="text-muted-foreground">API reference not provided.</div>
          )}
        </TabsContent>
        
        <TabsContent value="accessibility" className="py-4 space-y-6">
          {accessibility ? (
            accessibility
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Keyboard Interactions</h3>
              <p className="text-muted-foreground">
                This component follows WCAG guidelines and implements standard keyboard navigation.
              </p>
              <h3 className="text-lg font-semibold">ARIA Attributes</h3>
              <p className="text-muted-foreground">
                Appropriate ARIA attributes are applied to ensure screen reader compatibility.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface APIReferenceProps {
  componentName: string
  propsTable: {
    prop: string
    type: string
    default?: string
    description: string
  }[]
}

export function APIReference({ componentName, propsTable }: APIReferenceProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">{componentName} Props</h3>
      <div className="border rounded-md overflow-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr className="text-left text-xs border-b">
              <th className="font-medium p-3">Prop</th>
              <th className="font-medium p-3">Type</th>
              <th className="font-medium p-3">Default</th>
              <th className="font-medium p-3">Description</th>
            </tr>
          </thead>
          <tbody>
            {propsTable.map((prop, index) => (
              <tr key={index} className={cn("border-b", index === propsTable.length - 1 && "border-b-0")}>
                <td className="font-mono text-xs p-3 align-top">{prop.prop}</td>
                <td className="font-mono text-xs p-3 text-blue-600 dark:text-blue-400 align-top">{prop.type}</td>
                <td className="font-mono text-xs p-3 align-top">{prop.default || "-"}</td>
                <td className="text-xs p-3 align-top">{prop.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ComponentDocs 