"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Button,
  Container,
  H1,
  Lead,
  Modal,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Input
} from "@/components/ui";

// This was petOptions in page.tsx
const PET_TYPE_OPTIONS = [
  { value: "dog", label: "Dog" },
  { value: "cat", label: "Cat" },
  { value: "rabbit", label: "Rabbit" },
  { value: "bird", label: "Bird" },
  { value: "other", label: "Other" },
];

export function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPetType, setSelectedPetType] = useState("dog");
  // Add any other state needed specifically for the hero/modal, e.g. for input fields in modal

  return (
    <>
      <Container className="py-12 md:py-20 text-center">
        <H1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl lg:text-6xl">
          Turn Your Pet into a Work of Art
        </H1>
        <Lead className="mb-8 text-lg lg:text-xl sm:px-16 xl:px-48">
          Upload a photo of your beloved pet and let our AI transform it into a
          stunning masterpiece in various artistic styles. Create unique portraits,
          custom merchandise, and timeless keepsakes.
        </Lead>
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
          <Button size="lg" asChild>
            <Link href="/pets/new">Get Started Now</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => setIsModalOpen(true)}
          >
            Explore Styles (Demo Modal)
          </Button>
        </div>
        <div className="mt-10">
          <Image
            src="/placeholder-hero-pets.png" // Replace with actual hero image
            alt="Collection of pet portraits"
            width={800}
            height={400}
            className="rounded-lg shadow-xl mx-auto"
            priority // Hero image should be priority
          />
        </div>
      </Container>

      {/* Example Modal - this was part of the original page.tsx Home component */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Explore Art Styles (Demo)"
        description="This is a demo modal. Select options and see how they might interact."
      >
        <div className="space-y-4">
          <div>
            <Select value={selectedPetType} onValueChange={setSelectedPetType}>
              <SelectTrigger id="pet-type-select">
                <SelectValue placeholder="Select Pet Type" />
              </SelectTrigger>
              <SelectContent>
                {PET_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input type="text" placeholder="Enter pet's name (optional)" />
          <Button onClick={() => setIsModalOpen(false)} className="w-full">
            Close Modal
          </Button>
        </div>
      </Modal>
    </>
  );
} 