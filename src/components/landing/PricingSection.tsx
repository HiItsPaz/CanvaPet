"use client";

import { useState } from 'react';
import {
  Container,
  H2,
  P,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Grid // Added Grid for layout consistency
} from "@/components/ui";
import { Check } from 'lucide-react'; // For feature checkmarks

// Pricing plans data - this was part of the original page.tsx Home component
type PricingPlan = {
  name: string;
  price: string;
  period: string;
  features: string[];
  discount?: string;
  cta: string;
  highlight: boolean;
};

const pricingPlans: Record<string, PricingPlan[]> = {
  monthly: [
    {
      name: "Basic",
      price: "$9.99",
      period: "per month",
      features: [
        "3 pet portraits per month",
        "5 artistic styles",
        "Digital downloads",
        "Basic editing tools",
      ],
      cta: "Choose Basic",
      highlight: false,
    },
    {
      name: "Premium",
      price: "$19.99",
      period: "per month",
      features: [
        "10 pet portraits per month",
        "15 artistic styles",
        "Digital downloads",
        "Advanced editing tools",
        "Priority processing",
        "10% discount on merchandise",
      ],
      cta: "Choose Premium",
      highlight: true,
    },
    {
      name: "Family",
      price: "$29.99",
      period: "per month",
      features: [
        "Unlimited pet portraits",
        "All artistic styles",
        "Digital downloads",
        "Advanced editing tools",
        "Priority processing",
        "20% discount on merchandise",
        "Family sharing (up to 5 members)",
      ],
      cta: "Choose Family",
      highlight: false,
    },
  ],
  annual: [
    {
      name: "Basic",
      price: "$99.99",
      period: "per year",
      features: [
        "3 pet portraits per month",
        "5 artistic styles",
        "Digital downloads",
        "Basic editing tools",
      ],
      discount: "Save $19.89",
      cta: "Choose Basic",
      highlight: false,
    },
    {
      name: "Premium",
      price: "$199.99",
      period: "per year",
      features: [
        "10 pet portraits per month",
        "15 artistic styles",
        "Digital downloads",
        "Advanced editing tools",
        "Priority processing",
        "10% discount on merchandise",
      ],
      discount: "Save $39.89",
      cta: "Choose Premium",
      highlight: true,
    },
    {
      name: "Family",
      price: "$299.99",
      period: "per year",
      features: [
        "Unlimited pet portraits",
        "All artistic styles",
        "Digital downloads",
        "Advanced editing tools",
        "Priority processing",
        "20% discount on merchandise",
        "Family sharing (up to 5 members)",
      ],
      discount: "Save $59.89",
      cta: "Choose Family",
      highlight: false,
    },
  ],
};

export function PricingSection() {
  const [selectedPricingTab, setSelectedPricingTab] = useState("monthly");

  return (
    <section className="py-12 md:py-20">
      <Container>
        <div className="text-center mb-10">
          <H2>Flexible Pricing for Everyone</H2>
          <P className="text-lg text-muted-foreground mt-2">
            Choose the plan that's right for you and start creating today.
          </P>
        </div>

        <Tabs value={selectedPricingTab} onValueChange={setSelectedPricingTab} className="w-full max-w-md mx-auto mb-10">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="annual">Annual (Save up to 20%)</TabsTrigger>
          </TabsList>
          
          {Object.keys(pricingPlans).map((period) => (
            <TabsContent key={period} value={period}>
              <Grid columns={{ default: 1, md: 2, lg: 3 }} className="gap-6 items-stretch">
                {pricingPlans[period].map((plan) => (
                  <Card key={plan.name} className={`flex flex-col ${plan.highlight ? 'border-primary shadow-lg' : ''}`}>
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      {plan.discount && <P className="text-sm text-primary font-semibold">{plan.discount}</P>}
                      <P className="text-4xl font-bold my-2">{plan.price}</P>
                      <CardDescription>{plan.period}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <ul className="space-y-2">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" variant={plan.highlight ? 'default' : 'outline'}>
                        {plan.cta}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </Grid>
            </TabsContent>
          ))}
        </Tabs>
      </Container>
    </section>
  );
} 