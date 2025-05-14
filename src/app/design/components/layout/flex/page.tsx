"use client"

import { ComponentDocs, ComponentExample, APIReference, CodeBlock } from "@/components/ui/component-docs"
import { Row, Column } from "@/components/ui/flex"
import { Card } from "@/components/ui/card"

export default function FlexDocsPage() {
  return (
    <ComponentDocs
      title="Flex Layout Components"
      description="Flexible and responsive row/column-based layouts using flexbox."
      componentName="Row"
      examples={
        <div className="space-y-8">
          <ComponentExample
            title="Basic Row and Column Layout"
            description="A simple row with equally spaced columns."
          >
            <div className="bg-slate-100 p-4 rounded-lg">
              <Row gap="md">
                <Column className="bg-blue-100 p-4 rounded">Column 1</Column>
                <Column className="bg-blue-100 p-4 rounded">Column 2</Column>
                <Column className="bg-blue-100 p-4 rounded">Column 3</Column>
              </Row>
            </div>
          </ComponentExample>

          <ComponentExample
            title="Responsive Column Widths"
            description="Columns with different widths at different breakpoints."
          >
            <div className="bg-slate-100 p-4 rounded-lg">
              <Row gap="md">
                <Column 
                  width={{ default: 12, md: 6, lg: 4 }}
                  className="bg-blue-100 p-4 rounded"
                >
                  Full width on mobile, half on tablets, third on desktop
                </Column>
                <Column 
                  width={{ default: 12, md: 6, lg: 4 }}
                  className="bg-blue-100 p-4 rounded"
                >
                  Full width on mobile, half on tablets, third on desktop
                </Column>
                <Column 
                  width={{ default: 12, lg: 4 }}
                  className="bg-blue-100 p-4 rounded"
                >
                  Full width on mobile and tablets, third on desktop
                </Column>
              </Row>
            </div>
          </ComponentExample>

          <ComponentExample
            title="Alignment and Spacing"
            description="Control alignment and space distribution between items."
          >
            <div className="bg-slate-100 p-4 rounded-lg h-40">
              <Row 
                gap="md" 
                justify="between" 
                align="center"
                className="h-full"
              >
                <Column className="bg-blue-100 p-4 rounded h-20 flex items-center">Start</Column>
                <Column className="bg-blue-100 p-4 rounded h-16 flex items-center">Center</Column>
                <Column className="bg-blue-100 p-4 rounded h-24 flex items-center">End</Column>
              </Row>
            </div>
          </ComponentExample>

          <ComponentExample
            title="Responsive Direction"
            description="Change row direction at different breakpoints."
          >
            <div className="bg-slate-100 p-4 rounded-lg">
              <Row 
                gap="md" 
                reverse={{ default: false, md: true }}
                className="text-center"
              >
                <Column className="bg-blue-200 p-4 rounded">First on mobile, Last on desktop</Column>
                <Column className="bg-blue-300 p-4 rounded">Middle</Column>
                <Column className="bg-blue-400 p-4 rounded">Last on mobile, First on desktop</Column>
              </Row>
            </div>
          </ComponentExample>

          <ComponentExample
            title="Column Distribution"
            description="Control how columns grow and shrink."
          >
            <div className="bg-slate-100 p-4 rounded-lg">
              <Row gap="md">
                <Column 
                  width={3}
                  className="bg-blue-100 p-4 rounded"
                >
                  Fixed (3/12)
                </Column>
                <Column 
                  grow
                  className="bg-blue-200 p-4 rounded"
                >
                  Grow
                </Column>
                <Column 
                  width={2}
                  className="bg-blue-100 p-4 rounded"
                >
                  Fixed (2/12)
                </Column>
              </Row>
            </div>
          </ComponentExample>

          <ComponentExample
            title="Nested Layout"
            description="Nest rows and columns for complex layouts."
          >
            <div className="bg-slate-100 p-4 rounded-lg">
              <Row gap="md">
                <Column width={4} className="bg-blue-50 p-4 rounded">
                  Sidebar
                </Column>
                <Column width={8} className="bg-blue-50 p-4 rounded">
                  <Row gap="sm">
                    <Column width={12} className="bg-blue-100 p-4 rounded mb-4">
                      Header
                    </Column>
                    <Column width={6} className="bg-blue-200 p-4 rounded">
                      Content Left
                    </Column>
                    <Column width={6} className="bg-blue-200 p-4 rounded">
                      Content Right
                    </Column>
                  </Row>
                </Column>
              </Row>
            </div>
          </ComponentExample>
        </div>
      }
      apiReference={
        <>
          <APIReference
            componentName="Row"
            propsTable={[
              {
                prop: "reverse",
                type: "boolean | ResponseProps<boolean>",
                default: "false",
                description: "Reverse the direction of the row. Can be responsive."
              },
              {
                prop: "justify",
                type: "\"start\" | \"center\" | \"end\" | \"between\" | \"around\" | \"evenly\" | ResponsiveProps<...>",
                default: "\"start\"",
                description: "Horizontal alignment of items. Can be responsive."
              },
              {
                prop: "align",
                type: "\"start\" | \"center\" | \"end\" | \"stretch\" | \"baseline\" | ResponsiveProps<...>",
                default: "\"start\"", 
                description: "Vertical alignment of items. Can be responsive."
              },
              {
                prop: "wrap",
                type: "boolean | \"reverse\" | ResponsiveProps<boolean | \"reverse\">",
                default: "false",
                description: "Controls how items wrap. Can be responsive."
              },
              {
                prop: "gap",
                type: "\"none\" | \"xs\" | \"sm\" | \"md\" | \"lg\" | \"xl\" | ResponsiveProps<...>",
                default: "\"none\"",
                description: "Gap between items. Can be responsive."
              },
              {
                prop: "as",
                type: "React.ElementType",
                default: "\"div\"",
                description: "Element to render as."
              }
            ]}
          />

          <APIReference
            componentName="Column"
            propsTable={[
              {
                prop: "width",
                type: "number | string | ResponsiveProps<number | string>",
                description: "Width of column, from 1-12 (fractions) or specific values. Can be responsive."
              },
              {
                prop: "grow",
                type: "boolean | number | ResponsiveProps<boolean | number>",
                default: "false",
                description: "Whether column should grow to fill space. Can be responsive."
              },
              {
                prop: "shrink",
                type: "boolean | number | ResponsiveProps<boolean | number>",
                default: "true",
                description: "Whether column should shrink if needed. Can be responsive."
              },
              {
                prop: "order",
                type: "number | ResponsiveProps<number>",
                description: "Order of the column. Can be responsive."
              },
              {
                prop: "offset",
                type: "number | ResponsiveProps<number>",
                description: "Offset of the column. Can be responsive."
              },
              {
                prop: "as",
                type: "React.ElementType",
                default: "\"div\"",
                description: "Element to render as."
              }
            ]}
          />

          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Basic Row/Column Example</h3>
            <CodeBlock
              code={`
<Row gap="md">
  <Column width={{ default: 12, md: 6, lg: 4 }}>
    Full width on mobile, half on tablet, third on desktop
  </Column>
  <Column width={{ default: 12, md: 6, lg: 4 }}>
    Full width on mobile, half on tablet, third on desktop
  </Column>
  <Column width={{ default: 12, md: 12, lg: 4 }}>
    Full width on mobile and tablet, third on desktop
  </Column>
</Row>
              `}
            />

            <h3 className="text-lg font-semibold">Complex Layout Example</h3>
            <CodeBlock
              code={`
<Row gap="md" align="stretch">
  <Column width={{ default: 12, lg: 3 }} className="bg-gray-100 p-4">
    Sidebar (full width on mobile, quarter on desktop)
  </Column>
  <Column width={{ default: 12, lg: 9 }}>
    <Row gap="md" wrap>
      {items.map((item) => (
        <Column key={item.id} width={{ default: 12, sm: 6, lg: 4 }}>
          <Card>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>{item.content}</CardContent>
          </Card>
        </Column>
      ))}
    </Row>
  </Column>
</Row>
              `}
            />
          </div>
        </>
      }
    />
  )
} 