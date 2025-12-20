'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface SidebarContextType {
  leftSidebarVisible: boolean
  rightSidebarVisible: boolean
  toggleLeftSidebar: () => void
  toggleRightSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [leftSidebarVisible, setLeftSidebarVisible] = useState(true)
  const [rightSidebarVisible, setRightSidebarVisible] = useState(true)

  const toggleLeftSidebar = () => setLeftSidebarVisible(prev => !prev)
  const toggleRightSidebar = () => setRightSidebarVisible(prev => !prev)

  return (
    <SidebarContext.Provider value={{
      leftSidebarVisible,
      rightSidebarVisible,
      toggleLeftSidebar,
      toggleRightSidebar
    }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}