'use client'

import { useState, useEffect } from 'react'

interface ROutputProps {
  children: string
  title?: string
}

export function ROutput({ children, title }: ROutputProps) {
  const [copied, setCopied] = useState(false)
  const [isDark, setIsDark] = useState(false)
  
  // Check if dark mode is active
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    
    checkDarkMode()
    
    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    return () => observer.disconnect()
  }, [])
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children.trim())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy output:', err)
    }
  }

  return (
    <div className="relative group my-6 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 shadow-sm">
      {title && (
        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{title}</span>
        </div>
      )}
      
      <div className="relative">
        {/* Copy button */}
        <button
          onClick={copyToClipboard}
          className="absolute top-3 right-3 z-10 px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
          title="Copy output"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
        
        {/* Output badge */}
        <div className="absolute top-3 left-3 z-10 px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded-md font-medium shadow-sm">
          R OUTPUT
        </div>
        
        <pre 
          className={`m-0 px-4 pt-12 pb-4 text-sm leading-relaxed font-mono overflow-x-auto ${
            isDark 
              ? 'bg-gray-900 text-gray-200' 
              : 'bg-gray-50 text-gray-800'
          }`}
          style={{
            whiteSpace: 'pre',
            tabSize: 4
          }}
        >
          {children.trim()}
        </pre>
      </div>
    </div>
  )
}