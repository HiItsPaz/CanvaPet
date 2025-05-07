"use client";

import { useState } from 'react';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  Container,
  Grid,
  H1,
  H2,
  Lead,
  P,
  Input,
  ResponsiveTable,
  Select,
  Modal,
  Column
} from "@/components/ui";
import type { Database } from "@/types/supabase";

type Pet = Database["public"]["Tables"]["pets"]["Row"];

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("dog");
  
  const petOptions = [
    { value: "dog", label: "Dog" },
    { value: "cat", label: "Cat" },
    { value: "rabbit", label: "Rabbit" },
    { value: "bird", label: "Bird" },
    { value: "other", label: "Other" },
  ];

  // Sample data for responsive table
  const tableData: Pet[] = [
    { id: "1", name: "Max", species: "Dog", breed: "Golden Retriever", created_at: new Date().toISOString(), user_id: "user1", image_path: null, portrait_path: null },
    { id: "2", name: "Luna", species: "Cat", breed: "Siamese", created_at: new Date().toISOString(), user_id: "user2", image_path: null, portrait_path: null },
    { id: "3", name: "Buddy", species: "Dog", breed: "Labrador", created_at: new Date().toISOString(), user_id: "user3", image_path: null, portrait_path: null },
    { id: "4", name: "Coco", species: "Bird", breed: "Cockatiel", created_at: new Date().toISOString(), user_id: "user4", image_path: null, portrait_path: null },
  ];

  const tableColumns: Column<Pet>[] = [
    { header: "Name", accessor: "name" },
    { header: "Species", accessor: "species" },
    { header: "Breed", accessor: "breed" },
    {
      header: "Created At",
      accessor: "created_at",
      cell: (item: Pet) => new Date(item.created_at).toLocaleDateString(),
    },
  ];

  return (
    <>
      <section className="bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-950 py-16 md:py-24">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <H1 className="mb-6 text-gray-900 dark:text-white">
              Turn Your Pet Photos Into Beautiful AI Portraits
            </H1>
            <Lead className="mb-8">
              Upload a photo of your beloved pet and our AI will transform it into a stunning portrait in various artistic styles.
            </Lead>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">Get Started</Button>
              <Button size="lg" variant="outline" onClick={() => setIsModalOpen(true)}>
                Learn More
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <H2 className="text-center mb-10">UI Component Library Demo</H2>
          
          <Grid columns={{ default: 1, md: 2, lg: 3 }} gap="lg" className="mb-12">
            <Card>
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
                <CardDescription>Various button styles and sizes</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
                <Button isLoading>Loading</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Form Controls</CardTitle>
                <CardDescription>Input and select components</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Input 
                  label="Pet Name" 
                  placeholder="Enter your pet's name" 
                  helper="We'll use this for the portrait" 
                />
                <Input 
                  label="Email" 
                  type="email" 
                  placeholder="your@email.com" 
                  error="Please enter a valid email" 
                />
                <Select 
                  label="Pet Type" 
                  options={petOptions} 
                  value={selectedOption} 
                  onChange={setSelectedOption} 
                />
              </CardContent>
              <CardFooter>
                <Button className="w-full">Submit</Button>
              </CardFooter>
            </Card>

            <Card variant="outline">
              <CardHeader>
                <CardTitle>Card Variants</CardTitle>
                <CardDescription>Available card styling options</CardDescription>
              </CardHeader>
              <CardContent>
                <P className="mb-2">This is an outline card variant.</P>
                <P className="text-sm text-gray-500 dark:text-gray-400">
                  Cards can be used for grouping related content and actions.
                </P>
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="ghost" size="sm">Cancel</Button>
                <Button size="sm">Save</Button>
              </CardFooter>
            </Card>
          </Grid>

          <H2 className="text-center mb-6">Responsive Table Example</H2>
          <P className="text-center mb-6 max-w-2xl mx-auto">
            This table transforms into cards on mobile devices for better readability and usability.
            Try resizing your browser window to see how it adapts.
          </P>
          
          <div className="mb-16">
            <ResponsiveTable 
              data={tableData} 
              columns={tableColumns} 
              keyField="id" 
            />
          </div>
        </Container>
      </section>

      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <Container>
          <div className="max-w-4xl mx-auto">
            <H2 className="text-center mb-10">Grid System</H2>
            
            <P className="text-center mb-8">
              Our responsive grid system adapts to different screen sizes.
            </P>

            <div className="space-y-6">
              <Grid columns={{ default: 1 }} gap="md">
                <div className="bg-primary-100 dark:bg-primary-900 p-4 text-center rounded">1 Column</div>
              </Grid>
              
              <Grid columns={{ default: 2 }} gap="md">
                <div className="bg-primary-100 dark:bg-primary-900 p-4 text-center rounded">2 Columns</div>
                <div className="bg-primary-100 dark:bg-primary-900 p-4 text-center rounded">2 Columns</div>
              </Grid>
              
              <Grid columns={{ default: 1, md: 3 }} gap="md">
                <div className="bg-primary-100 dark:bg-primary-900 p-4 text-center rounded">3 Columns on tablet+</div>
                <div className="bg-primary-100 dark:bg-primary-900 p-4 text-center rounded">3 Columns on tablet+</div>
                <div className="bg-primary-100 dark:bg-primary-900 p-4 text-center rounded">3 Columns on tablet+</div>
              </Grid>
              
              <Grid columns={{ default: 2, md: 4 }} gap="md">
                <div className="bg-primary-100 dark:bg-primary-900 p-4 text-center rounded">4 Columns on desktop</div>
                <div className="bg-primary-100 dark:bg-primary-900 p-4 text-center rounded">4 Columns on desktop</div>
                <div className="bg-primary-100 dark:bg-primary-900 p-4 text-center rounded">4 Columns on desktop</div>
                <div className="bg-primary-100 dark:bg-primary-900 p-4 text-center rounded">4 Columns on desktop</div>
              </Grid>
            </div>
          </div>
        </Container>
      </section>

      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="About CanvaPet"
        description="Learn more about our AI pet portrait service"
      >
        <div className="mt-4">
          <P className="mb-4">
            CanvaPet uses state-of-the-art AI technology to transform your pet photos into beautiful portraits in various artistic styles. Our service is easy to use and produces stunning results.
          </P>
          <P className="mb-4">
            Simply upload a photo of your pet, choose your preferred art style, and customize additional options. Our AI will generate a beautiful portrait that you can download or order as physical merchandise.
          </P>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => setIsModalOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
