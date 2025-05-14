import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPetById } from "@/lib/petApi";
import { CustomizationProvider } from "@/contexts/CustomizationContext";
import { CustomizationInterfaceWithContext } from "@/components/customization/CustomizationInterfaceWithContext";
import { generatePreview, saveCustomization, fetchCustomization } from "@/lib/previewService";
import { getCustomizationHistory, CustomizationRecord } from "@/lib/customizationApi";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// This is a Server Component that will be rendered on the server
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const pet = await getPetById(params.id);
    return {
      title: `Customize ${pet?.name || 'Pet'} | CanvaPet`,
      description: `Customize ${pet?.name || 'your pet'} with different styles, backgrounds, and accessories.`,
    };
  } catch {
    return {
      title: "Customize Pet | CanvaPet",
      description: "Transform your pet with different styles and accessories.",
    };
  }
}

// This is a Server Component that will be rendered on the server
export default async function CustomizePetPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  try {
    // Fetch pet data
    const pet = await getPetById(params.id);
    
    if (!pet) {
      notFound();
    }
    
    // Fetch existing customization
    const existingCustomization = await fetchCustomization(pet.id);
    
    // Fetch history
    const history: CustomizationRecord[] = await getCustomizationHistory(pet.id);
    
    // If no active customization, but history exists, offer to load the latest historical one?
    // For now, we just use what fetchCustomization (which gets active) returns.
    // This could be a future enhancement: UI to select from history.

    return (
      <div className="container py-6 max-w-5xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Link href={`/pets/${pet.id}`} className="flex items-center text-muted-foreground hover:text-foreground mr-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to {pet.name}
            </Link>
            <h1 className="text-2xl font-bold">Customize {pet.name}</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            {history.length > 0 ? `${history.length} saved ${history.length === 1 ? 'version' : 'versions'}` : 'No saved versions yet'}
          </div>
        </div>
        
        <Separator className="mb-6" />
        
        <CustomizationProvider
          petId={pet.id}
          initialParameters={existingCustomization || undefined}
          onPreview={(params) => generatePreview(pet.id, params)}
          onSave={(params) => saveCustomization(pet.id, params)}
        >
          <CustomizationInterfaceWithContext petName={pet.name} />
        </CustomizationProvider>
      </div>
    );
  } catch {
    // If pet not found or other error, show 404
    notFound();
  }
} 