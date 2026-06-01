import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'outline' | 'destructive' | 'warning' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'flex items-center justify-center gap-2 font-bold transition-all duration-300 ease-out active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-2xl';
  
  const variants = {
    primary: 'bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-[0_10px_25px_rgba(0,113,227,0.3)] hover:shadow-[0_15px_35px_rgba(0,113,227,0.4)] border-2 border-[#0071E3]/20 hover:border-white/40',
    secondary: 'bg-white hover:bg-gray-50 text-[#0071E3] border-2 border-[#0071E3]/20 hover:border-[#0071E3] shadow-sm',
    success: 'bg-[#34C759] hover:bg-[#30B753] text-white shadow-[0_10px_25px_rgba(52,199,89,0.3)] hover:shadow-[0_15px_35px_rgba(52,199,89,0.4)] border-2 border-[#34C759]/20 hover:border-white/40',
    outline: 'bg-transparent hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300',
    destructive: 'bg-[#FF3B30] hover:bg-[#FF453A] text-white shadow-[0_10px_25px_rgba(255,59,48,0.3)] hover:shadow-[0_15px_35px_rgba(255,59,48,0.4)] border-2 border-[#FF3B30]/20 hover:border-white/40',
    warning: 'bg-[#FF9500] hover:bg-[#FF9F0A] text-white shadow-[0_10px_25px_rgba(255,149,0,0.3)] hover:shadow-[0_15px_35px_rgba(255,149,0,0.4)] border-2 border-[#FF9500]/20 hover:border-white/40',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-600',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-8 py-3.5 text-sm',
    lg: 'px-10 py-4 text-base',
  };

  const variantStyles = variants[variant] || variants.primary;
  const sizeStyles = sizes[size] || sizes.md;

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
};

export default Button;
