import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '' 
}) => {
  const baseStyle = "px-6 py-3 rounded-xl font-medium transition-all duration-200";
  const variants = {
    primary: "bg-blue-500 text-white hover:bg-blue-600 active:scale-95",
    secondary: "bg-white text-blue-500 border-2 border-blue-500 hover:bg-blue-50 active:scale-95",
    ghost: "text-blue-500 hover:bg-blue-50 active:scale-95"
  };
  
  return (
    <button 
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};