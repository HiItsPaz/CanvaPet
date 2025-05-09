/**
 * AI Services Configuration
 * 
 * This file contains configurations for different AI services used in the application:
 * - OpenAI for portrait generation
 * - Replicate for upscaling/enhancement
 * 
 * It handles secure API key management and rate limiting.
 */

// Environment variable validation
const getRequiredEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    // In development, log a clear error message
    if (process.env.NODE_ENV === 'development') {
      console.error(`Missing required environment variable: ${key}`);
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

// Rate limiting configuration
export interface RateLimitConfig {
  maxRequests: number;  // Max requests per time window
  windowMs: number;     // Time window in milliseconds
  tokensPerRequest?: number; // For token-based rate limiting (e.g., OpenAI)
}

// Default rate limit configurations
export const DEFAULT_RATE_LIMITS = {
  openai: {
    maxRequests: 50,    // 50 requests
    windowMs: 60000,    // per minute (60 seconds)
    tokensPerRequest: 1000 // approximate avg token usage per request
  } as RateLimitConfig,
  replicate: {
    maxRequests: 10,     // 10 requests
    windowMs: 60000      // per minute (60 seconds)
  } as RateLimitConfig
};

// OpenAI Configuration
export const getOpenAIConfig = () => ({
  apiKey: getRequiredEnvVar('OPENAI_API_KEY'),
  rateLimit: DEFAULT_RATE_LIMITS.openai,
  defaultModel: 'dall-e-3',
  maxRetries: 3,
  timeout: 60000, // 60 seconds
});

// Replicate Configuration (for Clarity Upscaler)
export const getReplicateConfig = () => ({
  apiKey: getRequiredEnvVar('REPLICATE_API_KEY'),
  rateLimit: DEFAULT_RATE_LIMITS.replicate,
  clarityUpscalerModel: 'philz1337x/clarity-upscaler:dfad4170cdbb19b23209a7b3d1e18bab562ecacffb05bd51e895440f1db14194',
  maxRetries: 3,
  timeout: 120000, // 120 seconds
});

// Map to store the last request times for rate limiting
type ServiceKey = 'openai' | 'replicate';
const requestTimestamps: Record<ServiceKey, number[]> = {
  openai: [],
  replicate: []
};

// Token usage tracking for OpenAI (simple implementation)
let openAITokenUsage = {
  total: 0,
  resetTime: Date.now() + DEFAULT_RATE_LIMITS.openai.windowMs
};

/**
 * Rate limiting function for AI service requests
 * Uses a token bucket algorithm to limit requests
 */
export const checkRateLimit = (service: ServiceKey, tokens?: number): boolean => {
  const now = Date.now();
  const config = service === 'openai' ? DEFAULT_RATE_LIMITS.openai : DEFAULT_RATE_LIMITS.replicate;
  
  // Clean up old timestamps outside the current time window
  requestTimestamps[service] = requestTimestamps[service].filter(
    time => (now - time) < config.windowMs
  );
  
  // Special handling for OpenAI token-based limiting
  if (service === 'openai' && tokens) {
    // Reset token usage if window elapsed
    if (now > openAITokenUsage.resetTime) {
      openAITokenUsage = {
        total: 0,
        resetTime: now + config.windowMs
      };
    }
    
    // Check token usage
    if (openAITokenUsage.total + (tokens || config.tokensPerRequest || 0) > 
        (config.maxRequests * (config.tokensPerRequest || 1000))) {
      return false; // Rate limit exceeded
    }
    
    // Update token usage
    openAITokenUsage.total += (tokens || config.tokensPerRequest || 0);
  } 
  // Standard request-based rate limiting
  else if (requestTimestamps[service].length >= config.maxRequests) {
    return false; // Rate limit exceeded
  }
  
  // Record this request
  requestTimestamps[service].push(now);
  return true; // Request allowed
};

/**
 * Helper function to get wait time if rate limited
 */
export const getRateLimitWaitTime = (service: ServiceKey): number => {
  const now = Date.now();
  const config = service === 'openai' ? DEFAULT_RATE_LIMITS.openai : DEFAULT_RATE_LIMITS.replicate;
  
  if (requestTimestamps[service].length === 0) return 0;
  
  // Get the oldest timestamp within the current window
  const oldestTimestamp = Math.min(...requestTimestamps[service]);
  
  // Calculate when it will expire from the window
  return Math.max(0, (oldestTimestamp + config.windowMs) - now);
};

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  failureThreshold: number;      // Number of failures before opening the circuit
  resetTimeoutMs: number;        // Time before attempting to close the circuit
  maxConsecutiveFailures: number; // Max failures in a row
}

export const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeoutMs: 30000, // 30 seconds
  maxConsecutiveFailures: 3
};

// Circuit breaker state
const circuitState: Record<ServiceKey, {
  isOpen: boolean;
  failures: number;
  consecutiveFailures: number;
  lastFailure: number;
}> = {
  openai: {
    isOpen: false,
    failures: 0,
    consecutiveFailures: 0,
    lastFailure: 0
  },
  replicate: {
    isOpen: false,
    failures: 0,
    consecutiveFailures: 0,
    lastFailure: 0
  }
};

/**
 * Circuit breaker check before making API calls
 */
export const checkCircuitBreaker = (service: ServiceKey): boolean => {
  const state = circuitState[service];
  const now = Date.now();
  
  // If circuit is open, check if reset timeout has elapsed
  if (state.isOpen) {
    if (now - state.lastFailure > DEFAULT_CIRCUIT_BREAKER_CONFIG.resetTimeoutMs) {
      // Close the circuit (half-open state)
      state.isOpen = false;
      return true;
    }
    return false; // Circuit is open, reject the request
  }
  
  return true; // Circuit is closed, allow the request
};

/**
 * Record success or failure for circuit breaker
 */
export const recordOutcome = (service: ServiceKey, success: boolean): void => {
  const state = circuitState[service];
  const now = Date.now();
  
  if (success) {
    // On success, reset consecutive failures
    state.consecutiveFailures = 0;
  } else {
    // On failure, update failure counters
    state.failures++;
    state.consecutiveFailures++;
    state.lastFailure = now;
    
    // Check if circuit should open
    if (state.consecutiveFailures >= DEFAULT_CIRCUIT_BREAKER_CONFIG.maxConsecutiveFailures || 
        state.failures >= DEFAULT_CIRCUIT_BREAKER_CONFIG.failureThreshold) {
      state.isOpen = true;
    }
  }
};

/**
 * Reset circuit breaker (typically used in tests or manual intervention)
 */
export const resetCircuitBreaker = (service: ServiceKey): void => {
  circuitState[service] = {
    isOpen: false,
    failures: 0,
    consecutiveFailures: 0,
    lastFailure: 0
  };
}; 