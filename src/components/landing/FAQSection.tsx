"use client";

import { useState } from 'react';
import {
  Container,
  H2,
  P
} from "@/components/ui";
import { PlusCircle, MinusCircle } from 'lucide-react'; // For accordion icons

// FAQ data - this was part of the original page.tsx Home component
const faqs = [
  {
    id: "faq1",
    question: "What kind of photos work best?",
    answer: "Clear, well-lit photos where your pet is the main focus work best. Avoid blurry images or photos where your pet is too far away. The better the photo, the better the portrait!",
  },
  {
    id: "faq2",
    question: "How long does it take to get my portrait?",
    answer: "Digital previews are typically ready within 24-48 hours. Physical product shipping times vary based on your location and the product chosen.",
  },
  {
    id: "faq3",
    question: "Can I request revisions?",
    answer: "Yes! We offer a revision process to ensure you're happy with your pet's portrait. Details are provided after your initial preview is ready.",
  },
  {
    id: "faq4",
    question: "What products can I get my portrait on?",
    answer: "We offer a wide range of products including framed prints, canvases, mugs, t-shirts, phone cases, and more. Explore our merchandise section after creating your portrait!",
  },
];

export function FAQSection() {
  const [faqOpen, setFaqOpen] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setFaqOpen(faqOpen === id ? null : id);
  };

  return (
    <section className="py-12 md:py-20 bg-muted">
      <Container className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <H2>Frequently Asked Questions</H2>
          <P className="text-lg text-muted-foreground mt-2">
            Find answers to common questions about our pet portraits and services.
          </P>
        </div>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.id} className="border rounded-lg bg-background shadow-sm">
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full flex justify-between items-center p-4 md:p-6 text-left focus:outline-none"
                aria-expanded={faqOpen === faq.id}
                aria-controls={`faq-content-${faq.id}`}
              >
                <span className="text-lg font-semibold">{faq.question}</span>
                {faqOpen === faq.id ? (
                  <MinusCircle className="h-6 w-6 text-primary" />
                ) : (
                  <PlusCircle className="h-6 w-6 text-muted-foreground" />
                )}
              </button>
              {faqOpen === faq.id && (
                <div id={`faq-content-${faq.id}`} className="p-4 md:p-6 border-t">
                  <P className="text-muted-foreground">
                    {faq.answer}
                  </P>
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
} 