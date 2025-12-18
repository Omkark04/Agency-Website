// frontend/src/components/ui/UserAvatar.tsx
import * as React from "react";
import { Avatar } from "@/components/ui/avatar";

interface UserAvatarProps {
  user?: {
    username?: string;
    avatar?: string | null;
    first_name?: string;
    last_name?: string;
  } | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  size = 'md', 
  className = '' 
}) => {
  const getInitials = () => {
    if (!user) return 'U';
    
    if (user.first_name && user.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    }
    
    if (user.username) {
      const parts = user.username.split(' ');
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
      }
      return user.username.charAt(0).toUpperCase();
    }
    
    return 'U';
  };

  const getDisplayName = () => {
    if (!user) return 'User';
    
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    
    return user.username || 'User';
  };

  return (
    <Avatar
      src={user?.avatar || undefined}
      alt={getDisplayName()}
      fallback={
        <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white font-bold">
          {getInitials()}
        </div>
      }
      className={`${sizeMap[size]} ${className}`}
    />
  );
};

export default UserAvatar;
