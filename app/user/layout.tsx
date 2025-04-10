'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BellIcon, Search, X, Heart, Building, Menu as MenuIcon } from "lucide-react";
import { UserProfile } from '@/components/user-profile';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { dataService, type SearchResult } from '@/lib/data-service';
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Mail,
  Package,
  Settings,
  LogOut,
} from "lucide-react";
import { NotificationsPopover } from "@/components/notifications-popover"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ProfileSettings } from '@/components/profile-settings';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard, permission: "dashboard" },
  { name: "Leads", href: "/user/leads", icon: Users, permission: "leads" },
  { name: "Calendar", href: "/user/calendar", icon: Calendar, permission: "calendar" },
  { name: "Email", href: "/user/email", icon: Mail, permission: "email" },
  { name: "Inventory", href: "/user/inventory", icon: Package, permission: "inventory" },
  { name: "Settings", href: "/user/settings", icon: Settings, permission: "settings" },
  { name: "Favorites", href: "/user/favorites", icon: Heart, permission: "favorites" },
  { name: "MLS", href: "/user/mls", icon: Building, permission: "mls" },
];

export default function UserLayout({ children }: UserLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userPermissions, setUserPermissions] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        setIsLoading(true);
        // Get user data from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setUserPermissions(parsedUser.permissions || {
            dashboard: true,
            leads: true,
            calendar: true,
            email: true,
            settings: true,
            inventory: true,
            favorites: true,
            mls: true
          });
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, [router]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;
  
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-red-500"></div>
          <p className="text-lg text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !userPermissions) {
    router.push('/login');
    return null;
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const results: SearchResult[] = dataService.search(query);
    setSearchResults(results);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  const handleResultClick = (result: SearchResult) => {
    router.push(result.link);
    clearSearch();
  };

  const handleUpdateAvatar = async (avatarUrl: string) => {
    try {
      const response = await fetch(`/api/users/${user._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatar: avatarUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to update avatar');
      }

      // Update local storage with new avatar
      const updatedUser = { ...user, avatar: avatarUrl };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    // Only remove auth-related items
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 z-50 flex w-72 flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-800 px-6">
            <div className="flex h-16 shrink-0 items-center">
              <Link href="/user/dashboard" className="flex items-center">
                <span className="text-2xl font-bold text-red-500">GetHome</span>
                <span className="ml-2 text-xl font-semibold text-gray-200">Realty</span>
              </Link>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => {
                      if (!userPermissions[item.permission]) return null;
                      const isActive = pathname === item.href;
                      return (
                        <motion.li key={item.name} whileHover={{ x: 4 }}>
                          <Link
                            href={item.href}
                            className={cn(
                              "group flex gap-x-3 rounded-md p-2 text-sm leading-6",
                              isActive
                                ? "bg-gray-700 text-red-500"
                                : "text-gray-400 hover:text-red-500 hover:bg-gray-700"
                            )}
                          >
                            <item.icon
                              className={cn(
                                "h-6 w-6 shrink-0",
                                isActive ? "text-red-500" : "text-gray-400 group-hover:text-red-500"
                              )}
                              aria-hidden="true"
                            />
                            {item.name}
                          </Link>
                        </motion.li>
                      );
                    })}
                  </ul>
                </li>
                <li className="mt-auto">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-x-3 text-gray-400 hover:text-red-500 hover:bg-gray-700"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-6 w-6 shrink-0" />
                    Logout
                  </Button>
                </li>
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="pl-72 w-full min-h-screen bg-gray-900">
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-gray-700 bg-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            {/* Left side */}
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-100">
                {navigation.find(item => item.href === pathname)?.name || 'Dashboard'}
              </h1>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <NotificationsPopover />
              <UserProfile user={user} onUpdateAvatar={handleUpdateAvatar} />
            </div>
          </div>

          {/* Page content */}
          <div className="py-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 