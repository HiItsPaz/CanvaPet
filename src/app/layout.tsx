import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Navigation } from "@/components/navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "CanvaPet",
  description: "Create beautiful portraits of your pets using AI",
  authors: [{ name: "CanvaPet Team" }],
  keywords: ["pet", "portrait", "AI", "art", "canvas", "pet portrait"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true, // Allow users to zoom for accessibility
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body
        className={`${inter.variable} ${montserrat.variable} font-sans antialiased min-h-full`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Navigation />
              <main className="flex-1">{children}</main>
              <footer className="py-6 border-t border-gray-200 dark:border-gray-800">
                <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  &copy; {new Date().getFullYear()} CanvaPet. All rights reserved.
                </div>
              </footer>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
