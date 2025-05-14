import Link from 'next/link';
import { 
  H1, 
  H2, 
  H3,
  H4,
  P,
  Lead,
  Large,
  Small,
  Subtle,
  Container
} from '@/components/ui';
import ClientTypographyContent from './client-content';

export const metadata = {
  title: 'Typography - CanvaPet Design',
  description: 'Typography guidelines and font usage for the CanvaPet design system',
};

export default function TypographyPage() {
  return (
    <Container className="py-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/design" className="inline-flex items-center text-sm text-primary hover:underline mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Design System
        </Link>

        <div className="space-y-10">
          <div>
            <H1 className="mb-4">Typography</H1>
            <Lead>A responsive typography system that adapts across different screen sizes.</Lead>
            <P className="mt-4">
              Our typography system is built using relative units (rem) and scales appropriately across
              devices. Font sizes are defined to adapt at different breakpoints, providing optimal readability
              on all devices from mobile phones to large desktop displays.
            </P>
          </div>

          <ClientTypographyContent />
        </div>
      </div>
    </Container>
  );
} 