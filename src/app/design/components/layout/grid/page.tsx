"use client"

import { ComponentDocs, ComponentExample, APIReference, CodeBlock } from "@/components/ui/component-docs"
import { Grid, GridArea } from "@/components/ui/grid"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"

export default function GridDocsPage() {
  return (
    <ComponentDocs
      title="Grid Layout System"
      description="Powerful CSS Grid-based responsive layout components."
      componentName="Grid"
      examples={
        <div className="space-y-8">
          <ComponentExample
            title="Basic Grid Layout"
            description="Simple responsive grid with automatic column sizing."
          >
            <div className="bg-slate-100 p-4 rounded-lg">
              <Grid gap="md">
                <div className="bg-blue-100 p-4 rounded">Item 1</div>
                <div className="bg-blue-100 p-4 rounded">Item 2</div>
                <div className="bg-blue-100 p-4 rounded">Item 3</div>
                <div className="bg-blue-100 p-4 rounded">Item 4</div>
                <div className="bg-blue-100 p-4 rounded">Item 5</div>
                <div className="bg-blue-100 p-4 rounded">Item 6</div>
              </Grid>
            </div>
          </ComponentExample>

          <ComponentExample
            title="Responsive Columns"
            description="Grid with different column counts at different breakpoints."
          >
            <div className="bg-slate-100 p-4 rounded-lg">
              <Grid 
                columns={{ 
                  default: 1, 
                  sm: 2, 
                  md: 3, 
                  lg: 4 
                }}
                gap="md"
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-blue-100 p-4 rounded">
                    Item {i + 1}
                  </div>
                ))}
              </Grid>
            </div>
          </ComponentExample>

          <ComponentExample
            title="Auto-Responsive Grid"
            description="Grid that automatically adjusts the number of columns based on available space."
          >
            <div className="bg-slate-100 p-4 rounded-lg">
              <Grid 
                columns={{ default: "auto-fit" }}
                minColWidth="180px"
                gap="md"
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-blue-100 p-4 rounded min-h-[100px]">
                    Item {i + 1}
                  </div>
                ))}
              </Grid>
            </div>
          </ComponentExample>

          <ComponentExample
            title="Grid Areas"
            description="Using named grid areas for complex layouts."
          >
            <div className="bg-slate-100 p-4 rounded-lg">
              <Grid 
                columns={{ default: 4 }}
                gap="md"
                areas={`
                  "header header header header"
                  "sidebar main main main"
                  "sidebar footer footer footer"
                `}
              >
                <GridArea area="header" className="bg-blue-200 p-4 rounded">
                  Header
                </GridArea>
                <GridArea area="sidebar" className="bg-blue-300 p-4 rounded min-h-[150px]">
                  Sidebar
                </GridArea>
                <GridArea area="main" className="bg-blue-100 p-4 rounded min-h-[100px]">
                  Main Content
                </GridArea>
                <GridArea area="footer" className="bg-blue-200 p-4 rounded">
                  Footer
                </GridArea>
              </Grid>
            </div>
          </ComponentExample>

          <ComponentExample
            title="Column and Row Spans"
            description="Items that span multiple columns or rows."
          >
            <div className="bg-slate-100 p-4 rounded-lg">
              <Grid 
                columns={{ default: 3 }}
                gap="md"
              >
                <GridArea colSpan={3} className="bg-blue-200 p-4 rounded">
                  Spans all 3 columns
                </GridArea>
                <GridArea colSpan={2} className="bg-blue-300 p-4 rounded">
                  Spans 2 columns
                </GridArea>
                <GridArea rowSpan={2} className="bg-blue-100 p-4 rounded flex items-center justify-center">
                  Spans 2 rows
                </GridArea>
                <GridArea className="bg-blue-100 p-4 rounded">
                  Regular item
                </GridArea>
                <GridArea className="bg-blue-100 p-4 rounded">
                  Regular item
                </GridArea>
              </Grid>
            </div>
          </ComponentExample>

          <ComponentExample
            title="Responsive Grid with Cards"
            description="A practical example showing how to create a responsive card layout."
          >
            <div className="bg-slate-100 p-4 rounded-lg">
              <Grid 
                columns={{ default: 1, sm: 2, lg: 3 }}
                gap="md"
              >
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="shadow-sm">
                    <CardHeader>
                      <CardTitle>Card {i + 1}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>This is an example of cards in a responsive grid layout.</p>
                    </CardContent>
                  </Card>
                ))}
              </Grid>
            </div>
          </ComponentExample>
        </div>
      }
      apiReference={
        <>
          <APIReference
            componentName="Grid"
            propsTable={[
              {
                prop: "columns",
                type: "{ default?: number | 'auto-fit' | 'auto-fill', sm?: number | 'auto-fit' | 'auto-fill', md?: number | 'auto-fit' | 'auto-fill', lg?: number | 'auto-fit' | 'auto-fill', xl?: number | 'auto-fit' | 'auto-fill', '2xl'?: number | 'auto-fit' | 'auto-fill' }",
                default: "{ default: 1, md: 2, lg: 3 }",
                description: "Number of columns at different breakpoints. Can be a fixed number or auto-fit/auto-fill."
              },
              {
                prop: "gap",
                type: "'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'",
                default: "'md'",
                description: "Gap between grid items."
              },
              {
                prop: "rowGap",
                type: "'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'",
                description: "Gap between rows, if different from column gap."
              },
              {
                prop: "minColWidth",
                type: "string",
                default: "'200px'",
                description: "Minimum width for columns when using auto-fit/auto-fill."
              },
              {
                prop: "maxColWidth",
                type: "string",
                default: "'1fr'",
                description: "Maximum width for columns when using auto-fit/auto-fill."
              },
              {
                prop: "areas",
                type: "string",
                description: "CSS grid-template-areas value for named grid areas."
              },
              {
                prop: "as",
                type: "React.ElementType",
                default: "'div'",
                description: "Element to render as."
              }
            ]}
          />

          <APIReference
            componentName="GridArea"
            propsTable={[
              {
                prop: "area",
                type: "string",
                description: "Named grid area to place the item in."
              },
              {
                prop: "colSpan",
                type: "number",
                description: "Number of columns this item should span."
              },
              {
                prop: "rowSpan",
                type: "number",
                description: "Number of rows this item should span."
              },
              {
                prop: "colStart",
                type: "number",
                description: "Grid column start line."
              },
              {
                prop: "colEnd",
                type: "number",
                description: "Grid column end line."
              },
              {
                prop: "rowStart",
                type: "number",
                description: "Grid row start line."
              },
              {
                prop: "rowEnd",
                type: "number",
                description: "Grid row end line."
              }
            ]}
          />

          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Basic Grid Example</h3>
            <CodeBlock
              code={`
<Grid
  columns={{ default: 1, sm: 2, md: 3, lg: 4 }}
  gap="md"
>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
</Grid>
              `}
            />

            <h3 className="text-lg font-semibold">Auto-Responsive Grid Example</h3>
            <CodeBlock
              code={`
<Grid
  columns={{ default: "auto-fit" }}
  minColWidth="200px"
  maxColWidth="1fr"
  gap="md"
>
  {items.map((item) => (
    <Card key={item.id}>
      <CardHeader>
        <CardTitle>{item.title}</CardTitle>
      </CardHeader>
      <CardContent>{item.content}</CardContent>
    </Card>
  ))}
</Grid>
              `}
            />

            <h3 className="text-lg font-semibold">Grid Areas Example</h3>
            <CodeBlock
              code={`
<Grid 
  columns={{ default: 4 }}
  gap="md"
  areas={
    "header header header header" +
    "sidebar main main main" +
    "sidebar footer footer footer"
  }
>
  <GridArea area="header">Header</GridArea>
  <GridArea area="sidebar">Sidebar</GridArea>
  <GridArea area="main">Main Content</GridArea>
  <GridArea area="footer">Footer</GridArea>
</Grid>
              `}
            />
          </div>
        </>
      }
    />
  )
} 