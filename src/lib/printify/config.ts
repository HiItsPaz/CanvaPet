/**
 * Printify Service Configuration
 * 
 * Handles API keys and base configuration for the Printify integration.
 */

const getRequiredEnvVar = (key: string): string => {
    const value = process.env[key];
    if (!value) {
      // Log clearly in development
      if (process.env.NODE_ENV === 'development') {
        console.error(`Missing required Printify environment variable: ${key}. Please add it to your .env.local file.`);
      }
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
};

export const getPrintifyConfig = () => ({
    apiKey: getRequiredEnvVar('PRINTIFY_API_KEY'),
    shopId: getRequiredEnvVar('PRINTIFY_SHOP_ID'),
    apiUrl: 'https://api.printify.com/v1',
    maxRetries: 3,
    timeout: 30000, // 30 seconds for standard calls
}); 