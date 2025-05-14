/**
 * Printify Service Configuration
 * 
 * Handles API keys and base configuration for the Printify integration.
 */

const getRequiredEnvVar = (key: string): string => {
    const value = process.env[key];
    if (!value) {
      // Warn in development
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing required Printify environment variable: ${key}. Using default empty string.`);
      }
      return '';
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