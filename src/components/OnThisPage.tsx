'use client'

import { useEffect, useState, useRef } from 'react'
import { useSidebar } from '@/contexts/SidebarContext'
import { SidebarToggle } from '@/components/SidebarToggle'

interface Heading {
  id: string
  text: string
  level: number
}

export default function OnThisPage() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const { rightSidebarVisible } = useSidebar()
  const containerRef = useRef<HTMLElement>(null)
  const activeLinkRefs = useRef<{ [key: string]: HTMLAnchorElement | null }>({})

  useEffect(() => {
    // Only look for headings within the main content area, not the entire page
    const mainContent = document.querySelector('.main-content-area')
    if (!mainContent) return

    const headingElements = mainContent.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const headingData: Heading[] = []
    const usedIds = new Set<string>()

    headingElements.forEach((element) => {
      const text = element.textContent || ''
      const level = parseInt(element.tagName.charAt(1))

      // Skip the main title (h1)
      if (level === 1) return

      let id = element.id
      if (!id) {
        // Generate ID from text if none exists
        const baseId = text.toLowerCase()
          .replace(/[^a-z0-9 -]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()

        // Ensure unique ID by adding counter if duplicate
        id = baseId
        let counter = 1
        while (usedIds.has(id)) {
          id = `${baseId}-${counter}`
          counter++
        }

        element.id = id
      }

      // Ensure this ID is unique even if element already had an ID
      if (usedIds.has(id)) {
        let counter = 1
        const baseId = id
        while (usedIds.has(id)) {
          id = `${baseId}-${counter}`
          counter++
        }
        element.id = id
      }

      usedIds.add(id)
      headingData.push({ id, text, level })
    })

    setHeadings(headingData)

    // Set up intersection observer for active section
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0.1
      }
    )

    headingElements.forEach((element) => {
      if (element.id) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [])

  // Auto-scroll to active section when it changes
  useEffect(() => {
    if (!activeId || !rightSidebarVisible) return

    const container = containerRef.current
    const activeLink = activeLinkRefs.current[activeId]

    if (!container || !activeLink) return

    // Small delay to ensure the DOM is ready
    setTimeout(() => {
      // Use offsetTop for accurate position within scrollable container
      const containerHeight = container.clientHeight
      const elementTop = activeLink.offsetTop
      const elementHeight = activeLink.offsetHeight

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
  }, [activeId, rightSidebarVisible])

  return (
    <aside ref={containerRef} className={`on-this-page-container ${!rightSidebarVisible ? 'minimized' : ''}`}>
      <div>
        <h3 className="on-this-page-title">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          On this page
        </h3>
        <div className="on-this-page-gradient-line"></div>
      </div>

      {headings.length > 0 ? (
        <>
          <nav className="on-this-page-nav">
            {headings.map((heading) => (
              <a
                key={heading.id}
                ref={(el) => {
                  activeLinkRefs.current[heading.id] = el
                }}
                href={`#${heading.id}`}
                className={`on-this-page-link level-${heading.level} ${
                  activeId === heading.id ? 'active' : ''
                }`}
                onClick={(e) => {
                  e.preventDefault()
                  const element = document.getElementById(heading.id)
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    setActiveId(heading.id)
                  }
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="on-this-page-indicator"></div>
                  {heading.text}
                </span>
              </a>
            ))}
          </nav>

          <div className="on-this-page-footer">
            <div className="on-this-page-section-count">
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
              {headings.length} sections
            </div>
          </div>
        </>
      ) : (
        <div className="on-this-page-empty-state">
          <p className="on-this-page-empty-text">
            This page has no section headings.
          </p>
        </div>
      )}

      <SidebarToggle side="right" />
    </aside>
  )
}