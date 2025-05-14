"use client";

import Image from 'next/image';
import {
  Container,
  Grid,
  H2,
  P,
  Card,
  CardContent,
  Avatar,
  AvatarImage,
  AvatarFallback
} from "@/components/ui";
import { Star } from 'lucide-react'; // For star ratings

// Placeholder testimonials - this was part of the original page.tsx Home component
const testimonials = [
  {
    id: 1,
    name: "Jennifer K.",
    image: "/placeholder-profile.jpg", // Replace with actual user image
    petImage: "/placeholder-pet-portrait-1.jpg", // Replace with actual pet portrait
    quote: "My golden retriever never looked so regal! The watercolor style captured his playful personality perfectly.",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael T.",
    image: "/placeholder-profile.jpg",
    petImage: "/placeholder-pet-portrait-2.jpg",
    quote: "I ordered portraits of my three cats in different styles. The attention to detail was incredible - even captured their unique personalities!",
    rating: 5,
  },
  {
    id: 3,
    name: "Sarah J.",
    image: "/placeholder-profile.jpg",
    petImage: "/placeholder-pet-portrait-3.jpg",
    quote: "The oil painting style made my cockatiel look like a masterpiece. Everyone asks where I got it when they visit!",
    rating: 4,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-12 md:py-20 bg-muted">
      <Container>
        <div className="text-center mb-10">
          <H2>Loved by Pet Parents</H2>
          <P className="text-lg text-muted-foreground mt-2">
            See what our happy customers are saying about their unique pet portraits.
          </P>
        </div>
        <Grid columns={{ default: 1, md: 2, lg: 3 }} className="gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="flex flex-col">
              <CardContent className="p-6 flex-grow flex flex-col items-center text-center">
                <Image
                  src={testimonial.petImage}
                  alt={`Pet portrait for ${testimonial.name}`}
                  width={200}
                  height={200}
                  className="rounded-lg mb-4 object-cover w-[200px] h-[200px] shadow-md"
                />
                <P className="italic text-muted-foreground mb-4 flex-grow">
                  &ldquo;{testimonial.quote}&rdquo;
                </P>
                <div className="flex items-center mt-auto">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.substring(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <P className="font-semibold">{testimonial.name}</P>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={i < testimonial.rating ? "fill-current" : ""} size={16}/>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Container>
    </section>
  );
} 