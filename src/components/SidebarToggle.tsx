'use client'

import { useSidebar } from '@/contexts/SidebarContext'

interface SidebarToggleProps {
  side: 'left' | 'right'
  className?: string
}

export function SidebarToggle({ side, className = '' }: SidebarToggleProps) {
  const { leftSidebarVisible, rightSidebarVisible, toggleLeftSidebar, toggleRightSidebar } = useSidebar()
  
  const isVisible = side === 'left' ? leftSidebarVisible : rightSidebarVisible
  const toggle = side === 'left' ? toggleLeftSidebar : toggleRightSidebar
  
  return (
    <button
      onClick={toggle}
      className={`sidebar-toggle sidebar-toggle-${side} ${className}`}
      aria-label={`Toggle ${side} sidebar`}
      title={`${isVisible ? 'Hide' : 'Show'} ${side} sidebar`}
    >
      <svg 
        width="16" 
        height="16" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        style={{ 
          transform: side === 'left' 
            ? (isVisible ? 'rotate(0deg)' : 'rotate(180deg)')
            : (isVisible ? 'rotate(0deg)' : 'rotate(180deg)'),
          transition: 'transform 0.2s ease'
        }}
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d={side === 'left' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} 
        />
      </svg>
    </button>
  )
}