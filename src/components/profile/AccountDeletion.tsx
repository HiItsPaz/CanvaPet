'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertCircle, 
  AlertTriangle, 
  Trash2, 
  Loader2, 
  ShieldAlert 
} from 'lucide-react';
import { Icon } from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AccountDeletion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  
  // Simulate account deletion
  async function handleDeleteAccount() {
    if (confirmation !== 'delete my account') {
      setError('Please type "delete my account" to confirm');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, this would call an API endpoint
      // const result = await deleteUserAccount();
      
      // Success - would typically redirect to a confirmation page
      window.location.href = '/auth/signin?deleted=true';
    } catch (err) {
      setError('Failed to delete account. Please try again later.');
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Alert variant="destructive" className="bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-900">
        <Icon icon={AlertTriangle} size="sm" className="text-red-600 dark:text-red-400 mr-2" />
        <AlertTitle className="text-red-800 dark:text-red-300">Danger Zone</AlertTitle>
        <AlertDescription className="text-red-700 dark:text-red-400">
          Account deletion is permanent. All your data, including your profile, images, and order history will be permanently removed.
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <Icon icon={AlertCircle} size="sm" className="mr-2" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="border rounded-lg p-6 border-destructive/20 bg-destructive/5">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Icon icon={ShieldAlert} size="md" className="text-destructive" />
            <h3 className="text-lg font-semibold">Delete Account</h3>
          </div>
          
          <p className="text-sm">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-2">
                <Icon icon={Trash2} size="sm" />
                <span>Delete Account</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Icon icon={AlertTriangle} size="sm" className="text-destructive" />
                  <span>Are you absolutely sure?</span>
                </DialogTitle>
                <DialogDescription className="pt-2">
                  This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <Label htmlFor="confirmation" className="text-sm font-medium mb-2 block">
                  Type <span className="font-semibold">&quot;delete my account&quot;</span> to confirm:
                </Label>
                <Input 
                  id="confirmation" 
                  value={confirmation} 
                  onChange={(e) => setConfirmation(e.target.value)}
                  className="border-destructive/50 focus:border-destructive"
                  placeholder="delete my account"
                />
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount} 
                  disabled={loading || confirmation !== 'delete my account'}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Icon icon={Loader2} size="sm" className="animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Icon icon={Trash2} size="sm" />
                      <span>Permanently Delete</span>
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
} 