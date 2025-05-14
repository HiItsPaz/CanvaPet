"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings, HelpCircle, ShoppingCart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useKeyboardShortcutsContext } from "@/contexts/KeyboardShortcutsContext";
import { GLOBAL_SHORTCUTS, NAVIGATION_SHORTCUTS, ShortcutConfig } from "@/lib/keyboardShortcuts";
import { KeyboardShortcutHint } from "./ui/keyboard-shortcut-hint";
import { CartPreview } from "./ui/cart-preview";
import { CartIcon } from "./ui/cart-icon";

interface NavItem {
  label: string;
  href: string;
  shortcutKey?: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { label: "Home", href: "/", shortcutKey: "g h" },
  { label: "My Pets", href: "/pets", shortcutKey: "g p", children: [
    { label: "My Pets", href: "/pets" },
    { label: "Upload Pet", href: "/pets/upload" }
  ]},
  { label: "Gallery", href: "/profile/gallery", shortcutKey: "g g" },
  { label: "Create Portrait", href: "/portraits/generate" },
];

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, loading, signOut } = useAuth();
  const { openShortcutsHelp, setScope } = useKeyboardShortcutsContext();

  // Set navigation scope when component mounts
  useEffect(() => {
    setScope('navigation');
    
    // Return to global scope when component unmounts
    return () => setScope('global');
  }, [setScope]);

  // Format user's initials for avatar fallback
  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return '?';
  };

  // Find keyboard shortcut for a navigation item
  const getShortcutForNav = (href: string): ShortcutConfig => {
    const shortcut = NAVIGATION_SHORTCUTS.find(shortcut => {
      switch (shortcut.action) {
        case 'navigate-home':
          return href === '/';
        case 'navigate-pets':
          return href === '/pets';
        case 'navigate-gallery':
          return href === '/profile/gallery';
        case 'navigate-profile':
          return href === '/profile';
        default:
          return false;
      }
    });
    
    return shortcut || NAVIGATION_SHORTCUTS[0];
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/75 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/75">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary-600 dark:text-primary-500">
              CanvaPet
            </span>
          </Link>
          <nav className="hidden md:flex space-x-4">
            {navItems.map((item) => (
              item.children ? (
                <DropdownMenu key={item.href}>
                  <DropdownMenuTrigger asChild>
                    <div className={`px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer flex items-center ${
                      pathname.startsWith(item.href)
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}>
                      {item.label}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 ml-1"
                      >
                        <path d="m6 9 6 6 6-6"></path>
                      </svg>
                      
                      {/* Add keyboard shortcut hint if available */}
                      {item.shortcutKey && (
                        <span className="hidden lg:inline-block ml-2">
                          <KeyboardShortcutHint 
                            shortcut={getShortcutForNav(item.href)} 
                            inline 
                          />
                        </span>
                      )}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-40">
                    {item.children.map((child) => (
                      <DropdownMenuItem key={child.href} asChild>
                        <Link 
                          href={child.href}
                          className="cursor-pointer w-full"
                        >
                          {child.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center ${
                    pathname === item.href
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  {item.label}
                  
                  {/* Add keyboard shortcut hint if available */}
                  {item.shortcutKey && (
                    <span className="hidden lg:inline-block ml-2">
                      <KeyboardShortcutHint 
                        shortcut={getShortcutForNav(item.href)} 
                        inline 
                      />
                    </span>
                  )}
                </Link>
              )
            ))}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          {/* Keyboard Shortcuts Help Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={openShortcutsHelp}
            aria-label="Keyboard shortcuts"
            className="relative hidden md:flex"
          >
            <HelpCircle className="h-5 w-5" />
            <span className="sr-only">Keyboard Shortcuts</span>
            
            {/* Add keyboard shortcut hint */}
            <span className="absolute -bottom-5 right-0">
              <KeyboardShortcutHint
                shortcut={GLOBAL_SHORTCUTS.find(s => s.action === 'toggle-help') || GLOBAL_SHORTCUTS[0]}
                tooltip
              />
            </span>
          </Button>
          
          {/* Cart Preview */}
          <div className="hidden md:block">
            <CartPreview type="popover" />
          </div>
          
          <ThemeToggle />
          <div className="hidden md:block">
            {loading ? (
              <Skeleton className="h-9 w-20" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.display_name || "User"} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-medium">{profile?.display_name || user.email}</p>
                      {profile?.display_name && (
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer flex w-full items-center justify-between">
                      <span className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </span>
                      <KeyboardShortcutHint 
                        shortcut={NAVIGATION_SHORTCUTS.find(s => s.action === 'navigate-profile') || NAVIGATION_SHORTCUTS[0]} 
                        inline 
                      />
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer flex w-full items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={signOut}
                    className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
                <Button size="sm" variant="default" asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
              </div>
            )}
          </div>
          <Link href="/checkout" className="md:hidden">
            <CartIcon size="sm" />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <XIcon /> : <MenuIcon />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/25 backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          
          {/* Side drawer */}
          <div className="fixed top-0 right-0 h-full w-3/4 max-w-sm bg-white dark:bg-gray-900 shadow-xl overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between mb-6">
                <Link 
                  href="/"
                  className="text-xl font-bold text-primary-600 dark:text-primary-500"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  CanvaPet
                </Link>
                <button 
                  className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
              
              {/* Mobile Navigation Items */}
              <nav className="flex flex-col space-y-2">
                {navItems.map((item) => (
                  item.children ? (
                    <div key={item.href} className="space-y-1">
                      <div className={`px-4 py-2 text-base font-medium rounded-md ${
                        pathname.startsWith(item.href)
                          ? "bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400"
                          : "text-gray-700 dark:text-gray-300"
                      }`}>
                        {item.label}
                      </div>
                      <div className="pl-4 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`px-4 py-2 text-sm block font-medium rounded-md transition-colors ${
                              pathname === child.href
                                ? "bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400"
                                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-4 py-3 text-base font-medium rounded-md transition-colors ${
                        pathname === item.href
                          ? "bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )
                ))}
                
                {/* Cart Link in Mobile Menu */}
                <Link
                  href="/checkout"
                  className="px-4 py-2 text-base font-medium rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Shopping Cart
                </Link>
                
                {/* Add keyboard shortcuts help button in mobile menu */}
                <button
                  className="px-4 py-2 text-base font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 w-full text-left flex items-center"
                  onClick={() => {
                    openShortcutsHelp();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <HelpCircle className="h-5 w-5 mr-2" />
                  Keyboard Shortcuts
                </button>
              </nav>
              
              <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                {loading ? (
                  <Skeleton className="h-10 w-full mb-4" />
                ) : user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.display_name || "User"} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{profile?.display_name || user.email}</p>
                        {profile?.display_name && (
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Link
                        href="/profile"
                        className="px-4 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 flex items-center"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="px-4 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 flex items-center"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="px-4 py-2 text-sm font-medium rounded-md transition-colors text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-800 flex items-center text-left"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Button size="sm" variant="outline" asChild className="w-full">
                      <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                        Sign Up
                      </Link>
                    </Button>
                    <Button size="sm" variant="default" asChild className="w-full">
                      <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
} 