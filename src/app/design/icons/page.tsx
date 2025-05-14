import { IconShowcase } from "@/components/ui/icon-showcase"

export const metadata = {
  title: "Icons | CanvaPet Design",
  description: "Icon system and guidelines for CanvaPet"
}

export default function IconsPage() {
  return (
    <div className="container mx-auto py-12 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Icon System</h1>
      <IconShowcase />
    </div>
  )
} 