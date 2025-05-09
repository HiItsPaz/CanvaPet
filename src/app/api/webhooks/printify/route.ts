import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js'; // Use standard client for service role potentially
import crypto from 'crypto';

// IMPORTANT: Use Service Role Key for backend updates from webhooks
// Ensure these are set in your environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PRINTIFY_WEBHOOK_SECRET = process.env.PRINTIFY_WEBHOOK_SECRET!;

// Initialize Supabase client with service role
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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

export async function POST(req: NextRequest) {
    // 1. Verify Signature
    if (!PRINTIFY_WEBHOOK_SECRET) {
        console.error('Printify webhook secret is not configured.');
        return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }
    
    // Read raw body first for verification
    const rawBody = await req.text();
    const signatureHeader = headers().get('x-pfy-signature'); // Check Printify docs for exact header name

    const isValid = await verifyPrintifyWebhookSignature(rawBody, signatureHeader, PRINTIFY_WEBHOOK_SECRET);
    if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 2. Parse Payload (now that verification is done)
    let event;
    try {
        event = JSON.parse(rawBody); // Parse the raw body we already read
    } catch (error) {
        console.error('Error parsing Printify webhook payload:', error);
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    console.log('Received Printify Webhook:', event.type, event.resource?.id);

    // 3. Handle Event Type
    try {
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
                
                // Prepare data to update our internal order
                const updateData: { status?: string; shipment_details?: any } = {};
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
                        .eq('id', internalOrder.id);

                    if (updateError) {
                        console.error(`Failed to update order ${internalOrder.id} from webhook:`, updateError);
                        // Consider retry logic or alerting
                    } else {
                         console.log(`Updated order ${internalOrder.id} status to ${updateData.status} via webhook.`);
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