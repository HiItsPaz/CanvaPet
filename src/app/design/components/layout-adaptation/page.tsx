import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveDebugger } from "@/components/ui/responsive-debugger";
import { 
  LayoutShift, 
  useContentAdaptation,
  ScrollContainer,
  CollapseWrapper,
  ResponsiveCollection,
  useViewport
} from "@/components/ui/layout-adaptation";
import { Badge } from "@/components/ui/badge";
import ClientLayoutAdaptationPage from './client-page';

export const metadata = {
  title: "Layout Adaptation Components | CanvaPet Design",
  description: "Components for adapting layouts to different viewport sizes"
};

// Sample data for demos
const exampleItems = [
  { id: 1, title: "Item One", description: "This is the first item" },
  { id: 2, title: "Item Two", description: "This is the second item" },
  { id: 3, title: "Item Three", description: "This is the third item" },
  { id: 4, title: "Item Four", description: "This is the fourth item" },
  { id: 5, title: "Item Five", description: "This is the fifth item" },
  { id: 6, title: "Item Six", description: "This is the sixth item" },
];

// Example usage component
function LayoutAdaptationExamples() {
  const { currentBreakpoint, isMobile, isTablet, isDesktop } = useViewport();
  
  // Example of using the content adaptation hook
  const welcomeMessage = useContentAdaptation({
    xs: "Welcome to mobile view",
    sm: "Welcome to small tablet view",
    md: "Welcome to tablet view",
    lg: "Welcome to desktop view",
    xl: "Welcome to large desktop view",
    "2xl": "Welcome to extra large desktop view",
    default: "Welcome to the app"
  });
  
  return (
    <div className="space-y-12">
      {/* Current Viewport Information */}
      <Card>
        <CardHeader>
          <CardTitle>Current Viewport</CardTitle>
          <CardDescription>Viewport information from the useViewport hook</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Breakpoint:</p>
                <p className="font-medium">{currentBreakpoint}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Device Type:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant={isMobile ? "default" : "outline"}>Mobile</Badge>
                  <Badge variant={isTablet ? "default" : "outline"}>Tablet</Badge>
                  <Badge variant={isDesktop ? "default" : "outline"}>Desktop</Badge>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Adaptive Content:</p>
              <p className="font-medium">{welcomeMessage}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* LayoutShift Example */}
      <Card>
        <CardHeader>
          <CardTitle>LayoutShift Component</CardTitle>
          <CardDescription>Changes the visual order of elements at different breakpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <p className="text-sm text-muted-foreground mb-2">
              Resize the window to see the order of these boxes change. On mobile, they appear as 1-2-3, 
              on tablet as 2-1-3, and on desktop as 3-2-1.
            </p>
            <div className="flex flex-col md:flex-row gap-4">
              <LayoutShift 
                order={{ xs: 1, sm: 1, md: 2, lg: 3 }}
                className="p-4 rounded bg-primary text-primary-foreground flex items-center justify-center"
              >
                Box 1
              </LayoutShift>
              <LayoutShift 
                order={{ xs: 2, sm: 2, md: 1, lg: 2 }}
                className="p-4 rounded bg-secondary text-secondary-foreground flex items-center justify-center"
              >
                Box 2
              </LayoutShift>
              <LayoutShift 
                order={{ xs: 3, sm: 3, md: 3, lg: 1 }}
                className="p-4 rounded bg-accent text-accent-foreground flex items-center justify-center"
              >
                Box 3
              </LayoutShift>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* ScrollContainer Example */}
      <Card>
        <CardHeader>
          <CardTitle>ScrollContainer Component</CardTitle>
          <CardDescription>Changes scroll direction based on viewport size</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-2">
              This container scrolls horizontally on larger screens and vertically on mobile.
            </p>
            <ScrollContainer 
              direction={{ 
                default: "vertical", 
                md: "horizontal" 
              }}
              className="h-40 border border-border rounded-md"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div
                  key={item}
                  className="flex-shrink-0 w-full md:w-60 h-32 bg-muted m-3 rounded-md flex items-center justify-center"
                >
                  Scroll Item {item}
                </div>
              ))}
            </ScrollContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* CollapseWrapper Example */}
      <Card>
        <CardHeader>
          <CardTitle>CollapseWrapper Component</CardTitle>
          <CardDescription>Collapses content at certain breakpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-2">
              This section is collapsed on mobile but expanded on larger screens. Click to expand.
            </p>
            <CollapseWrapper 
              summary="Advanced Options"
              collapsed={{ 
                default: true, 
                md: false 
              }}
              className="border-border"
            >
              <div className="space-y-4">
                <p>These are advanced options that are automatically collapsed on mobile screens to save space.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button variant="outline">Option 1</Button>
                  <Button variant="outline">Option 2</Button>
                  <Button variant="outline">Option 3</Button>
                  <Button variant="outline">Option 4</Button>
                </div>
              </div>
            </CollapseWrapper>
          </div>
        </CardContent>
      </Card>
      
      {/* ResponsiveCollection Example */}
      <Card>
        <CardHeader>
          <CardTitle>ResponsiveCollection Component</CardTitle>
          <CardDescription>Displays collections in different layouts based on viewport</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-2">
              This collection displays as a list on mobile, and a grid on larger screens.
            </p>
            <ResponsiveCollection
              items={exampleItems}
              displayType={{ default: "list", md: "grid" }}
              columns={{ default: 1, sm: 2, md: 3, lg: 4 }}
              renderItem={(item, displayType) => (
                <Card key={item.id}>
                  <CardContent className={displayType === "compact" ? "p-2" : "p-4"}>
                    <div className={`flex ${displayType === "list" ? "items-center" : "flex-col"}`}>
                      <div className={displayType === "list" ? "mr-4" : "mb-2"}>
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                          {item.id}
                        </div>
                      </div>
                      <div>
                        <h3 className={`font-medium ${displayType === "compact" ? "text-sm" : ""}`}>{item.title}</h3>
                        {displayType !== "compact" && (
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LayoutAdaptationPage() {
  return (
    <div className="container mx-auto py-12 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Layout Adaptation Components</h1>
      
      <div className="mb-12">
        <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg mb-6">
          <ResponsiveDebugger />
        </div>
        <p className="text-muted-foreground mb-4">
          These components help create responsive layouts that adapt to different viewport sizes. 
          They build upon the foundation of the responsive grid and container components to provide 
          more advanced adaptation capabilities.
        </p>
      </div>
      
      <ClientLayoutAdaptationPage />
    </div>
  );
} 