"use client";

import Image from 'next/image';
import Link from 'next/link';
import {
  Container,
  Grid,
  H2,
  P,
  Button
} from "@/components/ui";

// Sample data for featured styles - this was part of the original page.tsx Home component
const featuredStyles = [
  {
    name: "Classic Oil Painting",
    image: "/placeholder-style-oil.jpg", // Replace with actual style image
    link: "/styles/oil-painting",
  },
  {
    name: "Modern Watercolor",
    image: "/placeholder-style-watercolor.jpg", // Replace with actual style image
    link: "/styles/watercolor",
  },
  {
    name: "Cartoon Fun",
    image: "/placeholder-style-cartoon.jpg", // Replace with actual style image
    link: "/styles/cartoon",
  },
  {
    name: "Pixel Art",
    image: "/placeholder-style-pixel.jpg", // Replace with actual style image
    link: "/styles/pixel-art",
  },
];

export function FeaturedStylesSection() {
  return (
    <section className="py-12 md:py-20">
      <Container>
        <div className="text-center mb-10">
          <H2>Explore Our Popular Styles</H2>
          <P className="text-lg text-muted-foreground mt-2">
            Discover a variety of artistic styles to match your pet's personality.
          </P>
        </div>
        <Grid columns={{ default: 1, sm: 2, md: 4 }} className="gap-6">
          {featuredStyles.map((style) => (
            <Link 
              key={style.name} 
              href={style.link} 
              className="block group rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div>
                <Image
                  src={style.image}
                  alt={style.name}
                  width={400}
                  height={300}
                  className="object-cover w-full h-64 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-4 bg-background">
                  <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {style.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </Grid>
        <div className="text-center mt-10">
          <Button size="lg" variant="outline" asChild>
            <Link href="/styles">View All Styles</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
} 