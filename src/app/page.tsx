"use client";

import dynamic from 'next/dynamic';
import { Container, ResponsiveTable, Column, Modal, Button, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, H2 } from "@/components/ui";
import { useState } from 'react';

// Dynamically import all the new sections
const HeroSection = dynamic(() => import('@/components/landing/HeroSection').then(mod => mod.HeroSection), { loading: () => <p>Loading...</p> });
const HowItWorksSection = dynamic(() => import('@/components/landing/HowItWorksSection').then(mod => mod.HowItWorksSection), { loading: () => <p>Loading...</p> });
const FeaturedStylesSection = dynamic(() => import('@/components/landing/FeaturedStylesSection').then(mod => mod.FeaturedStylesSection), { loading: () => <p>Loading...</p> });
const TestimonialsSection = dynamic(() => import('@/components/landing/TestimonialsSection').then(mod => mod.TestimonialsSection), { loading: () => <p>Loading...</p> });
const PricingSection = dynamic(() => import('@/components/landing/PricingSection').then(mod => mod.PricingSection), { loading: () => <p>Loading...</p> });
const FAQSection = dynamic(() => import('@/components/landing/FAQSection').then(mod => mod.FAQSection), { loading: () => <p>Loading...</p> });

// Define a custom pet type for our demo data to avoid type errors
type DemoPet = {
  id: string;
  name: string;
  species: string;
  breed: string;
  created_at: string;
  user_id: string;
};

export default function Home() {
  // State for the ResponsiveTable demo and any other page-level modals/state
  const [isPageLevelModalOpen, setIsPageLevelModalOpen] = useState(false);
  const [pageLevelSelectedOption, setPageLevelSelectedOption] = useState("dog");

  // Sample data for responsive table, now using DemoPet type
  const tableData: DemoPet[] = [
    { id: "1", name: "Max", species: "Dog", breed: "Golden Retriever", created_at: new Date().toISOString(), user_id: "user1" },
    { id: "2", name: "Luna", species: "Cat", breed: "Siamese", created_at: new Date().toISOString(), user_id: "user2" },
    { id: "3", name: "Buddy", species: "Dog", breed: "Labrador", created_at: new Date().toISOString(), user_id: "user3" },
    { id: "4", name: "Coco", species: "Bird", breed: "Cockatiel", created_at: new Date().toISOString(), user_id: "user4" },
  ];

  const tableColumns: Column<DemoPet>[] = [
    { header: "Name", accessor: "name" },
    { header: "Species", accessor: "species" },
    { header: "Breed", accessor: "breed" },
    {
      header: "Created At",
      accessor: "created_at",
      cell: (item: DemoPet) => new Date(item.created_at).toLocaleDateString(),
    },
  ];
  
  // Options for the page-level demo modal
  const pageLevelPetOptions = [
    { value: "dog", label: "Dog" },
    { value: "cat", label: "Cat" },
    // Add other options if this modal has them
  ];

  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <FeaturedStylesSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />

      {/* Example of other content that might remain or be added to page.tsx */}
      {/* This includes the ResponsiveTable and the page-level Modal example */}
      <Container className="py-12 md:py-20">
        <H2 className="text-center mb-8">Demo Responsive Table</H2>
        <ResponsiveTable columns={tableColumns} data={tableData} keyField="id" />
        
        <div className="text-center mt-8">
            <Button onClick={() => setIsPageLevelModalOpen(true)} variant="secondary">
                Open Page-Level Demo Modal
            </Button>
        </div>
      </Container>
      
      {/* This is the modal that was at the end of the original Home function. */}
      {/* It is kept here as an example of page-level modal, potentially for different demo purposes. */}
      {/* If it was specifically the Hero section's modal, it's now redundant as HeroSection handles its own. */}
      <Modal 
        isOpen={isPageLevelModalOpen}
        onClose={() => setIsPageLevelModalOpen(false)}
        title="Page-Level Demo Modal"
        description="This is another demo modal, potentially for different interactions on the main page."
      >
        <div className="space-y-4">
          <div>
            <Select value={pageLevelSelectedOption} onValueChange={setPageLevelSelectedOption}>
              <SelectTrigger id="page-level-pet-type-select">
                <SelectValue placeholder="Select Pet Type" />
              </SelectTrigger>
              <SelectContent>
                {pageLevelPetOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input type="text" placeholder="Enter some demo text" />
          <Button onClick={() => setIsPageLevelModalOpen(false)} className="w-full">
            Close This Modal
          </Button>
        </div>
      </Modal>
    </>
  );
}
