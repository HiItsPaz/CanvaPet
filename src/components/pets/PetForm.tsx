"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pet, PetInsert, PET_SPECIES_OPTIONS, PetUpdate } from "@/types/pet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createPet, updatePet } from "@/lib/petApi";
import { useAuth } from "@/contexts/AuthContext";
import { PetPhotoUpload } from "@/components/pets/PetPhotoUpload";
import { AlertCircle, Loader2, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, XIcon } from "lucide-react";
import Image from "next/image";

interface PetFormProps {
  pet?: Pet;
  isEdit?: boolean;
  onSuccess?: (pet: Pet) => void;
}

// Zod schema for validation
const petFormSchema = z.object({
  name: z.string().min(1, { message: "Pet name is required." }).max(50, { message: "Name cannot exceed 50 characters." }),
  species: z.string().min(1, { message: "Species is required." }),
  breed: z.string().max(50, { message: "Breed cannot exceed 50 characters." }).optional().or(z.literal('')),
  age_years: z.coerce.number().int().min(0).max(100).optional().nullable(),
  original_image_url: z.string().url({ message: "Valid image URL required for primary photo." }).optional().or(z.literal('')).nullable(),
  // Note: Handling multi-photo upload/management separately (Subtask 13.6)
});

type PetFormData = z.infer<typeof petFormSchema>;

export function PetForm({ pet, isEdit = false, onSuccess }: PetFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(pet?.original_image_url || null);
  const [additionalImageUrls, setAdditionalImageUrls] = useState<string[]>(pet?.additional_image_urls || []);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);

  const form = useForm<PetFormData>({
    resolver: zodResolver(petFormSchema),
    defaultValues: {
      name: pet?.name || "",
      species: pet?.species || "",
      breed: pet?.breed || "",
      age_years: pet?.age_years ?? null,
      original_image_url: pet?.original_image_url || null,
    },
  });

  useEffect(() => {
    form.setValue('original_image_url', originalImageUrl);
  }, [originalImageUrl, form]);

  const handleSetPrimary = (url: string) => {
    const currentPrimary = originalImageUrl;
    setOriginalImageUrl(url);
    setAdditionalImageUrls(prev => {
      const updated = prev.filter(u => u !== url); 
      if (currentPrimary) {
        updated.push(currentPrimary);
      }
      return updated;
    });
  };

  const handleRemoveAdditional = (url: string) => {
    setAdditionalImageUrls(prev => prev.filter(u => u !== url));
  };

  const handleNewPhotosSelected = (files: File[]) => {
    setNewPhotos(prev => [...prev, ...files]);
  };

  const handleRemoveNewPhoto = (fileToRemove: File) => {
    setNewPhotos(prev => prev.filter(f => f !== fileToRemove));
  };

  async function onSubmit(values: PetFormData) {
    setIsSubmitting(true);
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    try {
      const payload = {
        ...values,
        user_id: user.id,
        age_years: values.age_years ?? null,
        original_image_url: originalImageUrl
      };
      if (payload.breed === '') delete (payload as any).breed;
      if (payload.original_image_url === null) delete (payload as any).original_image_url;
      if (payload.age_years === null) delete (payload as any).age_years;

      let savedPet: Pet;
      if (isEdit && pet) {
        savedPet = await updatePet(pet.id, payload as PetUpdate);
        toast({ title: "Pet Updated", description: `${savedPet.name} has been updated.` });
      } else {
        savedPet = await createPet(payload as PetInsert);
        toast({ title: "Pet Added", description: `${savedPet.name} has been added.` });
      }
      
      if (onSuccess) {
        onSuccess(savedPet);
      } else {
        router.push(isEdit ? `/pets/${savedPet.id}` : '/pets');
      }

    } catch (error: any) {
      console.error("Failed to save pet:", error);
      toast({ title: "Error Saving Pet", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{isEdit ? `Edit ${pet?.name || 'Pet'}` : 'Add New Pet'}</CardTitle>
            <CardDescription>{isEdit ? 'Update the details for your pet.' : 'Enter the details for your new pet.'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Buddy" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="species"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Species *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pet species" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PET_SPECIES_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="breed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Breed (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Golden Retriever" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="age_years"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age (Years, Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="e.g., 5"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? null : +e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="original_image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pet Photos</FormLabel>
                  <FormDescription>
                    Manage photos for your pet. The first photo is the primary one.
                  </FormDescription>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div className="border-2 border-primary rounded-lg p-1 relative aspect-square group">
                      {originalImageUrl ? (
                        <Image src={originalImageUrl} alt="Primary photo" fill className="object-cover rounded" unoptimized/>
                      ) : (
                        <div className="flex items-center justify-center h-full bg-muted text-muted-foreground text-xs">Primary Photo</div>
                      )}
                      <Badge className="absolute top-1 left-1">Primary</Badge>
                    </div>
                    {additionalImageUrls.map((url, index) => (
                      <div key={url} className="relative aspect-square group border rounded-lg p-1">
                        <Image src={url} alt={`Additional photo ${index + 1}`} fill className="object-cover rounded" unoptimized/>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                          <Button type="button" size="sm" variant="secondary" className="text-xs h-auto py-1 px-2" onClick={() => handleSetPrimary(url)}>Set Primary</Button>
                          <Button type="button" size="sm" variant="destructive" className="text-xs h-auto py-1 px-2" onClick={() => handleRemoveAdditional(url)}><Trash2 className="h-3 w-3 mr-1"/>Remove</Button>
                        </div>
                      </div>
                    ))}
                    <div className="border border-dashed rounded-lg aspect-square flex items-center justify-center">
                      <Label htmlFor="new-photos" className="cursor-pointer text-center p-2">
                        <PlusCircle className="h-6 w-6 mx-auto mb-1 text-muted-foreground"/>
                        <span className="text-xs text-muted-foreground">Add Photos</span>
                      </Label>
                      <Input 
                        id="new-photos" 
                        type="file" 
                        multiple 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => handleNewPhotosSelected(Array.from(e.target.files || []))}
                      />
                    </div>
                  </div>
                  {newPhotos.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">New photos to upload:</p>
                      <div className="flex flex-wrap gap-2">
                        {newPhotos.map((file, index) => (
                          <Badge key={index} variant="outline" className="group pl-2 pr-1">
                            {file.name}
                            <button onClick={() => handleRemoveNewPhoto(file)} className="ml-1 opacity-50 group-hover:opacity-100 focus:opacity-100 outline-none" aria-label={`Remove ${file.name}`}>
                              <XIcon className="h-3 w-3"/>
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Update Pet"
              ) : (
                "Add Pet"
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
} 