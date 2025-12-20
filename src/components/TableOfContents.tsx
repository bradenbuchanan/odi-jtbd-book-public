'use client'

import Link from 'next/link'
import { ChapterMetadata } from '../../lib/content'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useSidebar } from '@/contexts/SidebarContext'
import { SidebarToggle } from '@/components/SidebarToggle'

interface TableOfContentsProps {
  chapters: ChapterMetadata[]
  currentSlug?: string
}

export default function TableOfContents({ chapters, currentSlug }: TableOfContentsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { leftSidebarVisible } = useSidebar()
  const containerRef = useRef<HTMLElement>(null)
  const activeItemRef = useRef<HTMLLIElement>(null)

  // Internal use only - generates PDF dynamically via /api/generate-pdf
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDownloadPDF = useCallback(() => {
    window.open(`/api/generate-pdf?t=${Date.now()}`, '_blank')
  }, [])

  // Auto-scroll to active chapter when it changes
  useEffect(() => {
    if (!currentSlug || !leftSidebarVisible) return

    // Small delay to ensure the DOM is ready
    setTimeout(() => {
      const container = containerRef.current
      const activeItem = activeItemRef.current

      if (!container || !activeItem) return

      // Use offsetTop for accurate position within scrollable container
      const containerHeight = container.clientHeight
      const elementTop = activeItem.offsetTop
      const elementHeight = activeItem.offsetHeight

      // Calculate target scroll position to center the element
      const targetScroll = elementTop - (containerHeight / 2) + (elementHeight / 2)

      // Check if we need to scroll (only if element is not near center)
      const currentScroll = container.scrollTop
      const distanceFromTarget = Math.abs(targetScroll - currentScroll)

      // Only scroll if the element is more than 100px away from center position
      if (distanceFromTarget > 100) {
        container.scrollTo({
          top: Math.max(0, targetScroll), // Ensure non-negative
          behavior: 'smooth'
        })
      }
    }, 150)
  }, [currentSlug, leftSidebarVisible])

  const groupedChapters = chapters.reduce((acc, chapter) => {
    const part = chapter.part || 'Other'
    if (!acc[part]) {
      acc[part] = []
    }
    acc[part].push(chapter)
    return acc
  }, {} as Record<string, ChapterMetadata[]>)

  const filteredChapters = Object.entries(groupedChapters).reduce((acc, [part, partChapters]) => {
    const filtered = partChapters.filter(chapter => 
      (chapter.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (chapter.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (chapter.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) || false)
    )
    if (filtered.length > 0) {
      acc[part] = filtered
    }
    return acc
  }, {} as Record<string, ChapterMetadata[]>)

  return (
    <nav ref={containerRef} className={`toc-container ${!leftSidebarVisible ? 'minimized' : ''}`}>
      <div>
        <h2 className="toc-title">
          Practical Jobs-to-be-Done
        </h2>
        <div className="toc-gradient-line"></div>
      </div>
      
      <div className="toc-search-container">
        <div className="toc-search-icon">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search chapters..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="toc-search-input"
        />
      </div>

      <div>
        {Object.entries(filteredChapters).map(([part, partChapters]) => (
          <div key={part} className="toc-section">
            <h4 className="toc-section-title">
              {part}
            </h4>
            <ul className="toc-chapter-list">
              {partChapters.map((chapter) => {
                const isActive = currentSlug === chapter.slug
                return (
                  <li key={chapter.slug} ref={isActive ? activeItemRef : null}>
                    <Link
                      href={`/book/${chapter.slug}`}
                      className={`toc-chapter-link ${isActive ? 'active' : ''}`}
                    >
                      {chapter.title}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* PDF Download Link */}
      <div className="toc-download-section">
        <a
          href="/documents/Practical-Jobs-to-be-Done.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="toc-download-button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Download PDF</span>
        </a>
      </div>

      <SidebarToggle side="left" />
    </nav>
  )
}