import { NextRequest, NextResponse } from 'next/server';
// import { headers } from 'next/headers'; // Remove this import as we'll use req.headers directly
import { createClient } from '@supabase/supabase-js'; // Use standard client for service role potentially
import crypto from 'crypto';

// IMPORTANT: Use Service Role Key for backend updates from webhooks
// Ensure these are set in your environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key-for-build-process';
const PRINTIFY_WEBHOOK_SECRET = process.env.PRINTIFY_WEBHOOK_SECRET || 'dummy-secret-for-build-process';

// Initialize Supabase client with service role
// Make sure we only initialize this when needed (not during build)
let supabaseAdmin: ReturnType<typeof createClient>;

// Function to get the Supabase admin client lazily
const getSupabaseAdmin = () => {
  if (!supabaseAdmin) {
    // Check for actual keys at runtime
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required in runtime environment');
    }
    
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  }
  return supabaseAdmin;
};

/**
 * Verify the signature of the webhook request from Printify.
 * Uses raw body text and signature header.
 */
async function verifyPrintifyWebhookSignature(
    body: string, 
    signature: string | null, 
    secret: string
): Promise<boolean> {
    if (!signature) {
        console.warn('Missing Printify webhook signature');
        return false;
    }

    try {
        const hmac = crypto.createHmac('sha256', secret);
        // Use digest('base64') and compare with base64 signature as per Printify docs recommendation
        const digest = Buffer.from(hmac.update(body).digest('base64'), 'utf8');
        const checksum = Buffer.from(signature, 'base64');

        if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) {
             console.warn('Invalid Printify webhook signature');
            return false;
        }
    } catch (error) { 
        console.error('Error verifying Printify webhook signature:', error);
        return false;
    }

    return true;
}

interface PrintifyShipmentDetails {
  carrier?: string;
  tracking_number?: string;
  tracking_url?: string;
  shipped_at?: string; 
}

// Define the expected structure of Printify webhook events
interface PrintifyWebhookEvent {
  type: string;
  resource?: {
    id?: string;
    data?: {
      status?: string;
      shipments?: Array<{
        carrier?: string;
        number?: string;
        url?: string;
        shipped_at?: string;
      }>;
    };
  };
}

export async function POST(req: NextRequest) {
    // 1. Verify Signature
    if (!process.env.PRINTIFY_WEBHOOK_SECRET) {
        console.error('Printify webhook secret is not configured.');
        return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }
    
    // Read raw body first for verification
    const rawBody = await req.text();
    // Use req.headers directly instead of headers() function
    const signatureHeader = req.headers.get('x-pfy-signature'); // Check Printify docs for exact header name

    const isValid = await verifyPrintifyWebhookSignature(rawBody, signatureHeader, PRINTIFY_WEBHOOK_SECRET);
    if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 2. Parse Payload (now that verification is done)
    let event: PrintifyWebhookEvent;
    
    try {
        event = JSON.parse(rawBody) as PrintifyWebhookEvent;
    } catch (error) {
        console.error('Error parsing Printify webhook payload:', error);
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    console.log('Received Printify Webhook:', event.type, event.resource?.id);

    // 3. Handle Event Type
    try {
        // Get Supabase admin client only when we need it
        const supabaseAdmin = getSupabaseAdmin();

        switch (event.type) {
            case 'order:updated':
            case 'order:shipment:created': // Handle shipment updates
            case 'order:shipment:delivered':
                const orderData = event.resource?.data;
                const printifyOrderId = event.resource?.id;
                const orderStatus = orderData?.status; // e.g., "in-production", "fulfilled"
                const shipmentData = orderData?.shipments?.[0]; // Assuming one shipment for simplicity

                if (!printifyOrderId) {
                    console.warn('Webhook missing Printify Order ID');
                    break; // Ignore event if essential data is missing
                }

                // Find our internal order using printify_order_id
                const { data: internalOrder, error: findError } = await supabaseAdmin
                    .from('orders')
                    .select('id')
                    .eq('printify_order_id', printifyOrderId)
                    .maybeSingle(); // Use maybeSingle as order might not exist or be linked yet
                
                if (findError) {
                     console.error(`Error finding internal order for Printify ID ${printifyOrderId}:`, findError);
                     break;
                }
                if (!internalOrder) {
                     console.warn(`Internal order not found for Printify ID ${printifyOrderId}.`);
                     break;
                }
                
                // Explicitly type the internalOrder to have an id property
                const typedOrder = internalOrder as { id: string };
                
                // Prepare data to update our internal order
                const updateData: { status?: string; shipment_details?: PrintifyShipmentDetails } = {};
                if (orderStatus) {
                    // Map Printify status to our internal status if needed
                    updateData.status = orderStatus;
                }
                if (shipmentData) {
                    updateData.shipment_details = {
                        carrier: shipmentData.carrier,
                        tracking_number: shipmentData.number,
                        tracking_url: shipmentData.url,
                        shipped_at: shipmentData.shipped_at // Or parse event timestamp
                    };
                    // Optionally update status to 'shipped' based on this event
                    updateData.status = 'shipped'; 
                }
                
                 if (event.type === 'order:shipment:delivered') {
                    updateData.status = 'delivered';
                }

                if (Object.keys(updateData).length > 0) {
                    const { error: updateError } = await supabaseAdmin
                        .from('orders')
                        .update(updateData)
                        .eq('id', typedOrder.id);

                    if (updateError) {
                        console.error(`Failed to update order ${typedOrder.id} from webhook:`, updateError);
                        // Consider retry logic or alerting
                    } else {
                         console.log(`Updated order ${typedOrder.id} status to ${updateData.status} via webhook.`);
                    }
                }
                break;
            
            // Add handlers for other relevant events like cancellation, holds, etc.
            
            default:
                console.log(`Unhandled Printify event type: ${event.type}`);
        }
    } catch (error) {
         console.error('Error processing Printify webhook logic:', error);
         // Return 500 but Printify might retry if you don't return 200
         // Check Printify docs for expected webhook responses on error
         return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
    }

    // 4. Acknowledge Receipt
    return NextResponse.json({ received: true });
} 