'use client'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { useState, useEffect } from 'react'

interface CodeBlockProps {
  children: string
  className?: string
  language?: string
  showLineNumbers?: boolean
  title?: string
}

export function CodeBlock({ 
  children, 
  className = "", 
  language,
  showLineNumbers = true,
  title 
}: CodeBlockProps) {
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
  
  // Extract language from className (e.g., "language-r" -> "r")
  const lang = language || className.replace(/language-/, '') || 'text'
  
  // Map common language aliases
  const languageMap: { [key: string]: string } = {
    'r': 'r',
    'R': 'r',
    'python': 'python',
    'py': 'python',
    'javascript': 'javascript',
    'js': 'javascript',
    'typescript': 'typescript',
    'ts': 'typescript',
    'sql': 'sql',
    'bash': 'bash',
    'shell': 'bash',
    'json': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    'csv': 'csv'
  }
  
  const mappedLanguage = languageMap[lang.toLowerCase()] || 'text'
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children.trim())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
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
          title="Copy code"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
        
        {/* Language badge */}
        <div className="absolute top-3 left-3 z-10 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md uppercase font-medium shadow-sm">
          {mappedLanguage === 'r' ? 'R' : mappedLanguage}
        </div>
        
        <SyntaxHighlighter
          language={mappedLanguage}
          style={isDark ? vscDarkPlus : vs}
          showLineNumbers={showLineNumbers}
          customStyle={{
            margin: 0,
            padding: '3rem 1rem 1rem 1rem',
            fontSize: '14px',
            lineHeight: '1.6',
            background: isDark ? '#1e1e1e' : '#ffffff',
            borderRadius: '0px'
          }}
          lineNumberStyle={{
            color: isDark ? '#858585' : '#6e7681',
            fontSize: '12px',
            paddingRight: '1rem',
            minWidth: '2.5rem',
            textAlign: 'right' as const,
            borderRight: isDark ? '1px solid #333' : '1px solid #e1e4e8',
            marginRight: '1rem'
          }}
          codeTagProps={{
            style: {
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
              fontSize: '14px'
            }
          }}
        >
          {children.trim()}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

// Pre-configured R code block component for convenience
export function RCodeBlock({ 
  children, 
  title = "R Code",
  showLineNumbers = true 
}: { 
  children: string
  title?: string
  showLineNumbers?: boolean 
}) {
  return (
    <CodeBlock 
      language="r" 
      title={title}
      showLineNumbers={showLineNumbers}
    >
      {children}
    </CodeBlock>
  )
}

