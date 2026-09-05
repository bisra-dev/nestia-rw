
"use client";

interface AvatarProps {
  email: string;
}

export default function Avatar({ email }: AvatarProps) {
  let initials = "??";
  
  if (email) {
    const username = email.split("@")[0]; 
    const parts = username.split(/[._-]/); 
    
    if (parts.length > 1 && parts[0] && parts[1]) {
      initials = (parts[0][0] + parts[1][0]).toUpperCase();
    } else {    
      initials = username.substring(0, 2).toUpperCase();
    }
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-base font-semibold text-white shadow-sm select-none">
      {initials}
    </div>
  );
}
