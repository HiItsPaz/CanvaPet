import ResponsiveShowcase from "@/components/ui/responsive-showcase"

export const metadata = {
  title: "Responsive Design | CanvaPet Design",
  description: "Responsive design principles and component examples"
}

export default function ResponsivePage() {
  return (
    <div className="container mx-auto py-12 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Responsive Design</h1>
      <ResponsiveShowcase />
    </div>
  )
} 