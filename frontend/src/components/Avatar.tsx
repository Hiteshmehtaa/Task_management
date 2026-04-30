import React from 'react'

export default function Avatar({ name, src, size = 'md' }: { name?: string; src?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes: any = { sm: 'w-6 h-6 text-xs', md: 'w-8 h-8 text-sm', lg: 'w-10 h-10 text-base' }
  const initials = name ? name.split(' ').map(w => w[0]).join('').toUpperCase() : '?'
  return (
    <img
      src={src || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=7C3AED&color=fff`}
      alt={name}
      className={`${sizes[size]} rounded-full inline-block`}
    />
  )
}
