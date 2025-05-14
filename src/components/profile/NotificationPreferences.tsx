'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Bell, CheckCircle, AlertCircle, Loader2, Save } from 'lucide-react';
import { Icon } from '@/components/ui/icon';

interface NotificationPreferencesProps {
  initialPreferences?: {
    marketingEmails: boolean;
    orderUpdates: boolean;
    productUpdates: boolean;
    securityAlerts: boolean;
  };
}

export function NotificationPreferences({ 
  initialPreferences = {
    marketingEmails: true,
    orderUpdates: true,
    productUpdates: true,
    securityAlerts: true,
  } 
}: NotificationPreferencesProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [preferences, setPreferences] = useState(initialPreferences);

  // Simulate saving preferences to the backend
  async function handleSave() {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful update
      // In a real app, this would call an API endpoint
      // const result = await updateNotificationPreferences(preferences);
      
      setSuccess(true);
    } catch (err) {
      setError('Failed to update notification preferences');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {success && (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
          <Icon icon={CheckCircle} size="sm" className="text-green-600 dark:text-green-400 mr-2" />
          <AlertTitle className="text-green-800 dark:text-green-300">Preferences Updated</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-400">
            Your notification preferences have been updated successfully.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <Icon icon={AlertCircle} size="sm" className="mr-2" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="flex flex-col space-y-1.5">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Icon icon={Bell} size="sm" />
            <span>Email Notifications</span>
          </h3>
          <p className="text-sm text-muted-foreground">
            Choose which notifications you'd like to receive via email.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="marketing-emails" 
              checked={preferences.marketingEmails}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, marketingEmails: checked as boolean })
              }
            />
            <label
              htmlFor="marketing-emails"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Marketing emails (discounts, new features, etc.)
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="order-updates" 
              checked={preferences.orderUpdates}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, orderUpdates: checked as boolean })
              }
            />
            <label
              htmlFor="order-updates"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Order updates (shipping, delivery, etc.)
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="product-updates" 
              checked={preferences.productUpdates}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, productUpdates: checked as boolean })
              }
            />
            <label
              htmlFor="product-updates"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Product updates and new features
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="security-alerts" 
              checked={preferences.securityAlerts}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, securityAlerts: checked as boolean })
              }
            />
            <label
              htmlFor="security-alerts"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Security alerts (cannot be disabled)
            </label>
          </div>
        </div>
      </div>

      <Button 
        onClick={handleSave} 
        disabled={loading}
        className="flex items-center gap-2"
      >
        {loading ? (
          <>
            <Icon icon={Loader2} size="sm" className="animate-spin" />
            <span>Saving...</span>
          </>
        ) : (
          <>
            <Icon icon={Save} size="sm" />
            <span>Save Preferences</span>
          </>
        )}
      </Button>
    </div>
  );
} 