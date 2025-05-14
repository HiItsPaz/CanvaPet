"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Container,
  Grid,
  H2,
  H3,
  P
} from "@/components/ui";
import { UploadCloud, Palette, ShoppingBag } from 'lucide-react';

const steps = [
  {
    icon: <UploadCloud className="h-10 w-10 mb-4 text-primary" />,
    title: "1. Upload Your Pet's Photo",
    description: "Choose your favorite snapshot. Clear, well-lit photos work best!"
  },
  {
    icon: <Palette className="h-10 w-10 mb-4 text-primary" />,
    title: "2. Select Your Style",
    description: "Browse dozens of artistic styles - from classic oil painting to modern digital art."
  },
  {
    icon: <ShoppingBag className="h-10 w-10 mb-4 text-primary" />,
    title: "3. Customize & Order",
    description: "Preview your masterpiece, then order prints, canvases, mugs, and more!"
  }
];

export function HowItWorksSection() {
  return (
    <section className="py-12 md:py-20 bg-muted">
      <Container>
        <div className="text-center mb-10">
          <H2>How It Works</H2>
          <P className="text-lg text-muted-foreground mt-2">
            Creating your pet portrait is as easy as 1-2-3.
          </P>
        </div>
        <Grid columns={{ default: 1, sm: 2, md: 3 }} className="gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                {step.icon}
                <CardTitle className="text-xl">
                  <H3>{step.title}</H3>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <P className="text-muted-foreground">{step.description}</P>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Container>
    </section>
  );
} 