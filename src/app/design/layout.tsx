import { Metadata } from "next"
import DocumentationLayout from "@/components/ui/documentation-layout"

export const metadata: Metadata = {
  title: "Design System | CanvaPet",
  description: "Documentation for the CanvaPet design system"
}

export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DocumentationLayout>{children}</DocumentationLayout>
} 