'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Icon } from '@/components/ui/icon';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GoogleIcon } from '@/components/ui/icon-registry';

// Import social media icons
import { 
  Github, 
  Facebook,
  Twitter,
} from 'lucide-react';

type Provider = 'google' | 'facebook' | 'twitter' | 'github';

interface SocialLoginButtonProps {
  provider: Provider;
  disabled?: boolean;
  className?: string;
}

function SocialLoginButton({ provider, disabled, className }: SocialLoginButtonProps) {
  const [loading, setLoading] = useState(false);

  const getProviderData = () => {
    switch (provider) {
      case 'google':
        return {
          name: 'Google',
          icon: GoogleIcon,
          bgColor: 'bg-white hover:bg-slate-100',
          textColor: 'text-slate-800',
          borderColor: 'border-slate-300',
        };
      case 'facebook':
        return {
          name: 'Facebook',
          icon: Facebook,
          bgColor: 'bg-blue-600 hover:bg-blue-700',
          textColor: 'text-white',
          borderColor: 'border-blue-700',
        };
      case 'twitter':
        return {
          name: 'Twitter',
          icon: Twitter,
          bgColor: 'bg-sky-500 hover:bg-sky-600',
          textColor: 'text-white',
          borderColor: 'border-sky-600',
        };
      case 'github':
        return {
          name: 'GitHub',
          icon: Github,
          bgColor: 'bg-gray-900 hover:bg-black',
          textColor: 'text-white',
          borderColor: 'border-gray-950',
        };
      default:
        return {
          name: 'Provider',
          icon: GoogleIcon,
          bgColor: 'bg-primary hover:bg-primary/90',
          textColor: 'text-primary-foreground',
          borderColor: 'border-primary',
        };
    }
  };

  const { name, icon, bgColor, textColor, borderColor } = getProviderData();

  const handleLogin = async () => {
    try {
      setLoading(true);
      // Get the current URL for redirection after auth
      const redirectTo = `${window.location.origin}/auth/callback`;
      
      // Call Supabase auth
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });
      
      if (error) {
        console.error('Error signing in with provider:', error);
      }
    } catch (error) {
      console.error('Unexpected error during social login:', error);
    } finally {
      // Note: We don't need to set loading to false here as the page will redirect
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        'w-full flex items-center justify-center gap-2',
        'border',
        bgColor,
        textColor,
        borderColor,
        className
      )}
      disabled={disabled || loading}
      onClick={handleLogin}
    >
      {loading ? (
        <Icon icon={Loader2} size="sm" className="animate-spin" />
      ) : (
        <Icon icon={icon} size="sm" />
      )}
      <span>{loading ? `Connecting to ${name}...` : `Continue with ${name}`}</span>
    </Button>
  );
}

interface SocialLoginProps {
  className?: string;
  dividerClassName?: string;
}

export function SocialLogin({ className, dividerClassName }: SocialLoginProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className={cn('relative flex items-center', dividerClassName)}>
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="px-3 text-xs text-gray-500 uppercase">Or continue with</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <SocialLoginButton provider="google" />
        <SocialLoginButton provider="github" />
        <SocialLoginButton provider="facebook" />
        <SocialLoginButton provider="twitter" />
      </div>
    </div>
  );
} 