'use client';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from 'next/navigation';
import { Settings, LogOut } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface UserProfileProps {
  user: User;
  onUpdateAvatar: (avatarUrl: string) => Promise<void>;
  className?: string;
}

export function UserProfile({ user, onUpdateAvatar, className }: UserProfileProps) {
  const router = useRouter();

  const handleLogout = () => {
    // Clear all auth data
    localStorage.clear();
    
    // Clear the auth cookie
    document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Redirect to root page
    router.push('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`flex items-center gap-2 ${className || ''}`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-gray-800">{user.name}</p>
            <p className="text-xs text-gray-500">{user.role}</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-white border-gray-200"
        sideOffset={8}
      >
        <div className="sm:hidden px-2 py-2">
          <p className="text-sm font-medium text-gray-800">{user.name}</p>
          <p className="text-xs text-gray-500">{user.role}</p>
        </div>
        <DropdownMenuSeparator className="sm:hidden bg-gray-200" />
        <DropdownMenuLabel className="text-gray-800">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200" />
        <DropdownMenuItem 
          onClick={() => router.push('/settings/profile')}
          className="text-gray-800 focus:bg-gray-100 focus:text-gray-800"
        >
          <Settings className="mr-2 h-4 w-4" />
          Profile Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-200" />
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="text-red-500 focus:text-red-500 focus:bg-gray-100"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 