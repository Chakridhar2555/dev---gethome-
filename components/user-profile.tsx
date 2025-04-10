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
          <div className="text-left">
            <p className="text-sm font-medium text-gray-100">{user.name}</p>
            <p className="text-xs text-gray-400">{user.role}</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-700">
        <DropdownMenuLabel className="text-gray-100">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem 
          onClick={() => router.push('/settings/profile')}
          className="text-gray-100 focus:bg-gray-700 focus:text-gray-100"
        >
          <Settings className="mr-2 h-4 w-4" />
          Profile Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="text-red-400 focus:text-red-400 focus:bg-gray-700"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 