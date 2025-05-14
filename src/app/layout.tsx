export const dynamic = 'force-dynamic';
import type { Metadata, Viewport } from "next";
import { Inter, Montserrat, Open_Sans, Caveat } from "next/font/google";
import { Navigation } from "@/components/navigation";
import { SkipLink } from "@/components/ui/skip-link";
import { PageTransitionWrapper } from "@/components/ui/page-transition-wrapper";
import { ClientProviders } from "@/components/client-providers";
import "./globals.css";

// Define a type for the metric object
interface WebVitalsMetric {
  id: string;
  name: 'FCP' | 'LCP' | 'CLS' | 'FID' | 'TTFB' | 'INP'; // INP is the newer metric replacing FID
  startTime: number;
  value: number;
  label: 'web-vital' | 'custom';
  // Optional, specific to some metrics
  attribution?: Record<string, unknown>; 
  navigationType?: 'navigate' | 'reload' | 'back-forward';
}

// Function to report web vitals - can be defined in layout.tsx for App Router
export function reportWebVitals(metric: WebVitalsMetric) {
  // These metrics can be sent to any analytics service
  console.log(metric);
  // Example: Send to Google Analytics
  // if (metric.label === 'web-vital') {
  //   ga('send', 'event', {
  //     eventCategory: 'Web Vitals',
  //     eventAction: metric.name,
  //     eventLabel: metric.id, // id unique to current page load
  //     eventValue: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value), // values must be integers
  //     nonInteraction: true, // avoids affecting bounce rate
  //   });
  // }
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CanvaPet - Create Custom Pet Portraits",
  description: "Create, customize and order unique AI-generated pet portraits and merchandise.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true, // Ensure users can zoom for accessibility
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${montserrat.variable} ${openSans.variable} ${caveat.variable} font-sans`}
      >
        {/* Temporarily commented out ClientProviders to debug hydration error */}
        <ClientProviders>
          <>
            <SkipLink targetId="main-content" />
            <Navigation />
            <main id="main-content" tabIndex={-1}>
              <PageTransitionWrapper>
                {children}
              </PageTransitionWrapper>
            </main>
          </>
        </ClientProviders>
        {/* </ClientProviders> */}
      </body>
    </html>
  );
}
