export interface AnalyticsEvent {
  name: string;
  category?: string;
  label?: string;
  value?: number;
  // Additional properties specific to the event
  [key: string]: any;
}

/**
 * Tracks an analytics event.
 * This is a placeholder and should be integrated with a real analytics service.
 *
 * @param eventName The name of the event.
 * @param eventData Additional data associated with the event.
 */
export const trackEvent = (eventName: string, eventData?: Omit<AnalyticsEvent, 'name'>) => {
  const event: AnalyticsEvent = {
    name: eventName,
    ...eventData,
  };
  console.log('Analytics Event:', event);

  // TODO: Integrate with a real analytics service
  // Example: if (typeof window.gtag === 'function') { ... }
  // Example: if (typeof analytics !== 'undefined') { analytics.track(eventName, eventData); }
};

// Example Usage (can be called from components or other parts of the app):
// trackEvent('button_click', { category: 'Engagement', label: 'Learn More Button' });
// trackEvent('item_purchased', { category: 'Ecommerce', value: 19.99, itemId: 'SKU123' });

// Potential future enhancements:
// - Integration with specific analytics providers (GA4, Mixpanel, Segment, etc.)
// - User identification (e.g., analytics.identify(userId, { email: userEmail });)
// - Page view tracking (though Next.js often handles this with integrations)
// - A/B testing utilities
// - Funnel tracking utilities 