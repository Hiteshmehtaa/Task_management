import React from 'react'

export default function Skeleton({ width = 'w-full', height = 'h-4' }: { width?: string; height?: string }) {
  return <div className={`${width} ${height} bg-[rgba(255,255,255,0.06)] rounded animate-pulse`} />
}
