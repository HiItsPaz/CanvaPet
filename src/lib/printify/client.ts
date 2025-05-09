import { getPrintifyConfig } from './config';

// --- Basic Printify Types (Expand as needed) ---

export interface PrintifyBlueprint {
    id: number;
    title: string;
    description: string;
    brand: string;
    model: string;
    images: string[];
    // Add more fields based on API response
}

export interface PrintifyVariant {
    id: number;
    title: string; // e.g., "S / Black"
    options: { [key: string]: string | number }; // e.g., { size: "S", color: "#000000" }
    price: number; // In cents
    is_enabled: boolean;
    // Add more fields as needed
}

export interface PrintifyPrintProvider {
    id: number;
    title: string;
    // Add location, ranking, etc.
}

export interface PrintifyBlueprintDetails extends PrintifyBlueprint {
    print_provider_ids: number[];
    variants: PrintifyVariant[];
    print_areas: Record<string, any>; // Detailed print area info
    // Add more fields
}

// Add interfaces for Variants, PrintProviders, etc. as you implement those calls

// --- Type Definitions (Add/Expand as needed) ---

export interface PrintifyAddress {
    first_name: string;
    last_name: string;
    address1: string;
    address2?: string | null;
    city: string;
    region: string; // State/Province code
    country: string; // ISO 2-letter country code
    zip: string;
    phone?: string | null;
    email?: string | null;
}

export interface PrintifyLineItemInput {
    blueprint_id: number;
    variant_id: number;
    quantity: number;
    print_areas: { [key: string]: { src: string } }; // e.g., { front: { src: "image_url" } }
}

export interface PrintifyOrderInput {
    external_id: string; // Our internal order ID
    line_items: PrintifyLineItemInput[];
    shipping_method: number; // ID of the selected shipping method
    send_shipping_notification: boolean;
    address_to: PrintifyAddress;
}

export interface PrintifyShippingOption {
    method_id: number;
    name: string; // e.g., "Standard", "Express"
    price: number; // In cents
    currency: string;
    // Add delivery estimates etc.
}

export interface PrintifyOrderResult {
    id: string; // Printify Order ID
    status: string;
    // Add more fields from the response
}

// --- API Client Setup ---

const config = getPrintifyConfig();

/**
 * Makes a request to the Printify API with authorization and error handling.
 */
async function makePrintifyRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${config.apiUrl}${endpoint}`;
    const headers = {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    // Basic retry logic could be added here if needed
    try {
        const response = await fetch(url, {
            ...options,
            headers,
            // Add timeout logic if needed (fetch doesn't have built-in timeout like axios)
        });

        if (!response.ok) {
            let errorBody = 'Unknown error';
            try {
                errorBody = await response.text(); // Try to get error details
            } catch {}
            console.error(`Printify API Error (${response.status}): ${errorBody}`);
            throw new Error(`Printify API request failed with status ${response.status}`);
        }

        // Handle cases where response might be empty (e.g., 204 No Content)
        if (response.status === 204) {
            return null as T; // Or handle appropriately based on expected response
        }

        return await response.json() as T;

    } catch (error: any) {
        console.error(`Error during Printify API request to ${endpoint}:`, error);
        throw new Error(`Printify API request failed: ${error.message}`);
    }
}

// --- API Functions ---

/**
 * Fetches the list of available product blueprints (catalog).
 */
export async function getPrintifyBlueprints(): Promise<PrintifyBlueprint[]> {
    interface BlueprintResponse { data: PrintifyBlueprint[]; }
    const response = await makePrintifyRequest<BlueprintResponse>('/catalog/blueprints.json');
    return response?.data || [];
}

/**
 * Fetches detailed information for a specific blueprint, including variants.
 */
export async function getPrintifyBlueprintDetails(blueprintId: number): Promise<PrintifyBlueprintDetails | null> {
    try {
        const response = await makePrintifyRequest<PrintifyBlueprintDetails>(`/catalog/blueprints/${blueprintId}.json`);
        return response;
    } catch (error) {
        console.error(`Error fetching details for blueprint ${blueprintId}:`, error);
        return null; // Return null instead of throwing for easier handling in UI
    }
}

/**
 * Fetches available print providers for a specific blueprint.
 */
export async function getPrintifyPrintProviders(blueprintId: number): Promise<PrintifyPrintProvider[]> {
     interface ProvidersResponse { data: PrintifyPrintProvider[]; }
    try {
        const response = await makePrintifyRequest<ProvidersResponse>(`/catalog/blueprints/${blueprintId}/print_providers.json`);
        return response?.data || [];
    } catch (error) {
        console.error(`Error fetching print providers for blueprint ${blueprintId}:`, error);
        return [];
    }
}

/**
 * Fetches variant information for a specific blueprint and print provider.
 */
export async function getPrintifyBlueprintVariants(blueprintId: number, printProviderId: number): Promise<PrintifyVariant[]> {
    // Note: Printify API structure might differ, this is an example
    interface VariantsResponse {
         print_provider_id: number;
         variants: PrintifyVariant[];
    }
    try {
        // This specific endpoint might not exist exactly like this, 
        // often variants are part of getBlueprintDetails. Adjust as needed.
        const response = await makePrintifyRequest<VariantsResponse>(`/catalog/blueprints/${blueprintId}/print_providers/${printProviderId}/variants.json`);
        return response?.variants || [];
    } catch (error) {
        console.error(`Error fetching variants for blueprint ${blueprintId}, provider ${printProviderId}:`, error);
        return [];
    }
}

/**
 * Gets available shipping rates for a set of items and an address.
 */
export async function getPrintifyShippingRates(
    address: Pick<PrintifyAddress, 'country' | 'region' | 'zip'>,
    lineItems: Array<Pick<PrintifyLineItemInput, 'variant_id' | 'quantity'> & { blueprint_id?: number }> // Need variant ID and quantity
): Promise<PrintifyShippingOption[]> {
    
    // Printify shipping calculation might need blueprint_id per item? 
    // The docs suggest using product_id (which we create first) or sku.
    // Let's assume for now we need blueprint_id + variant_id.
    // Adapt this payload based on exact Printify requirements.
    const payload = {
        line_items: lineItems.map(item => ({
            // Pass blueprint_id if required by specific API version or logic
            // print_provider_id might also be needed
            variant_id: item.variant_id,
            quantity: item.quantity,
        })),
        address_to: {
            country: address.country,
            region: address.region,
            postal_code: address.zip, // API might use postal_code
        }
    };

    try {
        // Endpoint might differ slightly, check Printify docs
        // This might require creating a *product* first in Printify, then getting rates
        // Using a placeholder endpoint structure
        const response = await makePrintifyRequest<{
            standard: number, // Example response structure
            express?: number,
            // More options...
        }>(`/shops/${config.shopId}/shipping.json`, { 
            method: 'POST',
            body: JSON.stringify(payload) 
        });
        
        // Adapt response mapping based on actual API structure
        const options: PrintifyShippingOption[] = [];
        if (response?.standard) {
            options.push({ method_id: 1, name: 'Standard', price: response.standard, currency: 'USD' });
        }
         if (response?.express) {
            options.push({ method_id: 2, name: 'Express', price: response.express, currency: 'USD' });
        }
        // Map other potential options
        
        return options;
        
    } catch (error) {
        console.error('Failed to get shipping rates:', error);
        // Return empty or throw depending on desired UX
        return []; 
    }
}

/**
 * Creates an order in Printify.
 * Assumes payment has already been processed successfully.
 */
export async function createPrintifyOrder(
    orderInput: PrintifyOrderInput
): Promise<PrintifyOrderResult> {
    try {
        const response = await makePrintifyRequest<PrintifyOrderResult>(`/shops/${config.shopId}/orders.json`, {
            method: 'POST',
            body: JSON.stringify(orderInput),
        });
        return response;
    } catch (error) {
        console.error('Failed to create Printify order:', error);
        // Rethrow to be handled by the caller, potentially updating internal order status
        throw error;
    }
}

/**
 * Fetches the status of a specific Printify order.
 */
export async function getPrintifyOrderStatus(printifyOrderId: string): Promise<PrintifyOrderResult | null> {
     try {
        const response = await makePrintifyRequest<PrintifyOrderResult>(`/shops/${config.shopId}/orders/${printifyOrderId}.json`);
        return response;
    } catch (error) {
        console.error(`Error fetching status for Printify order ${printifyOrderId}:`, error);
        return null; // Return null if order not found or error occurs
    }
}

// Add more functions here later: getBlueprintDetails, getPrintProviders, createProduct, createOrder etc. 