'use client'

import { useSidebar } from '@/contexts/SidebarContext'
import { ReactNode } from 'react'

interface SidebarWrapperProps {
  children: ReactNode
}

export function SidebarWrapper({ children }: SidebarWrapperProps) {
  const { leftSidebarVisible, rightSidebarVisible } = useSidebar()
  
  let className = 'main-page-container'
  
  if (!leftSidebarVisible && !rightSidebarVisible) {
    className += ' both-minimized'
  } else if (!leftSidebarVisible) {
    className += ' left-minimized'
  } else if (!rightSidebarVisible) {
    className += ' right-minimized'
  }
  
  return (
    <div className={className}>
      {children}
    </div>
  )
}