"use client";

import Link from "next/link";
import { useState } from "react";
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
import { LogOut, User, Settings } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "My Pets", href: "/pets", children: [
    { label: "My Pets", href: "/pets" },
    { label: "Upload Pet", href: "/pets/upload" }
  ]},
  { label: "Gallery", href: "/gallery" },
  { label: "Create Portrait", href: "/create" },
];

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, loading, signOut } = useAuth();

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
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname === item.href
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  {item.label}
                </Link>
              )
            ))}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
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
                    <Link href="/profile" className="cursor-pointer flex w-full items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
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
          <button 
            className="md:hidden text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <XIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
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
              </nav>
              
              <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                {loading ? (
                  <Skeleton className="h-10 w-full mb-4" />
                ) : user ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-2 rounded-md bg-gray-50 dark:bg-gray-800">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.display_name || "User"} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{profile?.display_name || user.email}</span>
                        {profile?.display_name && (
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        )}
                      </div>
                    </div>
                    <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full mb-2" size="sm">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Button>
                    </Link>
                    <Button 
                      variant="destructive" 
                      className="w-full" 
                      size="sm"
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button 
                      className="w-full mb-2" 
                      variant="default"
                      onClick={() => setIsMobileMenuOpen(false)}
                      asChild
                    >
                      <Link href="/auth/signin">Sign In</Link>
                    </Button>
                    <Button 
                      className="w-full mb-4" 
                      variant="outline"
                      onClick={() => setIsMobileMenuOpen(false)}
                      asChild
                    >
                      <Link href="/auth/signup">Sign Up</Link>
                    </Button>
                  </>
                )}
                <div className="flex justify-center mt-4">
                  <ThemeToggle />
                </div>
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
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
        clipRule="evenodd"
      />
    </svg>
  );
} 