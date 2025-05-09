"use client";

import { Pet } from "@/types/pet";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Image as ImageIcon, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { deletePet } from "@/lib/petApi";

interface PetCardProps {
  pet: Pet;
  onDelete?: () => void;
}

export function PetCard({ pet, onDelete }: PetCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this pet? This action cannot be undone.")) {
      try {
        setIsDeleting(true);
        setError(null);
        await deletePet(pet.id);
        if (onDelete) onDelete();
      } catch (err) {
        console.error("Error deleting pet:", err);
        setError("Failed to delete pet. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative aspect-square bg-muted">
        {pet.original_image_url ? (
          <Image
            src={pet.original_image_url}
            alt={pet.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted text-muted-foreground">
            <ImageIcon className="h-12 w-12" />
          </div>
        )}
      </div>

      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">{pet.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/pets/${pet.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 flex-1">
        <div className="space-y-1">
          <p className="text-sm">
            <span className="font-medium">Species:</span> {pet.species}
          </p>
          {pet.breed && (
            <p className="text-sm">
              <span className="font-medium">Breed:</span> {pet.breed}
            </p>
          )}
          {pet.age_years && (
            <p className="text-sm">
              <span className="font-medium">Age:</span> {pet.age_years} {pet.age_years === 1 ? "year" : "years"}
            </p>
          )}
        </div>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button asChild variant="outline" className="w-full">
          <Link href={`/pets/${pet.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
} 