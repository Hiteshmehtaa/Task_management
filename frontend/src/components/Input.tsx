import React from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }

export default function Input({ label, error, ...rest }: Props) {
  return (
    <label className="block">
      {label ? <div className="text-sm text-secondary mb-1 font-medium">{label}</div> : null}
      <input
        className="w-full px-3 py-2 rounded bg-transparent border-2 border-border-default transition-all focus:outline-none focus:ring-2 focus:ring-violet focus:ring-offset-0 focus:border-violet hover:border-border-default/80"
        style={{ 
          color: '#FFFFFF',
        }}
        {...rest}
      />
      {error ? <div className="text-sm text-rose-400 mt-1">{error}</div> : null}
    </label>
  )
}
