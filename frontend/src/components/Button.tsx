import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg'; loading?: boolean }

export default function Button({ variant = 'primary', size = 'md', loading, children, className, ...rest }: Props) {
  const base = 'inline-flex items-center justify-center rounded-md transition-fast font-medium active:scale-95'
  const sizes: any = { sm: 'px-3 py-1 text-sm', md: 'px-4 py-2', lg: 'px-5 py-3 text-lg' }
  const variants: any = {
    primary: 'bg-primary hover:bg-primaryHover hover:brightness-110 text-white shadow-md hover:shadow-lg hover:shadow-primary/50',
    ghost: 'bg-transparent text-text-primary border border-border hover:bg-[rgba(124,58,237,0.08)]',
    danger: 'bg-rose-500 hover:bg-rose-400 hover:brightness-110 text-white shadow-md hover:shadow-lg'
  }
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} disabled:opacity-50 disabled:cursor-not-allowed ${className || ''}`} disabled={loading} {...rest}>
      {loading ? <span className="animate-spin mr-2">⏳</span> : null}
      {children}
    </button>
  )
}

