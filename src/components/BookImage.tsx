'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface BookImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  caption?: string
  priority?: boolean
  sizes?: string
  standalone?: boolean
  zoomable?: boolean
}

export function BookImage({
  src,
  alt,
  width = 800,
  height = 600,
  className = "",
  caption,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 800px",
  standalone = false,
  zoomable = false
}: BookImageProps) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Safety check for required props
  if (!src || !alt) {
    console.warn('BookImage: src and alt props are required')
    return null
  }
  const baseImageClasses = `h-auto object-contain rounded-lg ${className}`.trim()
  const imageClasses = zoomable ? `${baseImageClasses} cursor-pointer hover:opacity-90 transition-opacity` : baseImageClasses

  // When used as img replacement, render simple Image without figure
  if (!caption && !standalone) {
    return (
      <>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes={sizes}
          className={imageClasses}
          style={{border: 'none', outline: 'none', boxShadow: 'none'}}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          quality={100}
          onClick={zoomable ? () => setIsZoomed(true) : undefined}
        />
        {zoomable && isZoomed && isMounted && (
          <ImageModal
            src={src}
            alt={alt}
            onClose={() => setIsZoomed(false)}
          />
        )}
      </>
    )
  }
  
  // When used as standalone component with caption, render full figure
  const figureClasses = `my-8 ${className}`.trim()
  const figureImageClasses = zoomable ? "h-auto object-contain cursor-pointer hover:opacity-90 transition-opacity" : "h-auto object-contain"

  return (
    <>
      <figure className={figureClasses}>
        <div className="relative overflow-hidden rounded-lg" style={{border: 'none', boxShadow: 'none'}}>
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            priority={priority}
            sizes={sizes}
            className={figureImageClasses}
            style={{border: 'none', outline: 'none', boxShadow: 'none'}}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            quality={100}
            onClick={zoomable ? () => setIsZoomed(true) : undefined}
          />
          {zoomable && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded text-xs">
              Click to zoom
            </div>
          )}
        </div>
        {caption && (
          <figcaption className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center italic">
            {caption}
          </figcaption>
        )}
      </figure>
      {zoomable && isZoomed && isMounted && (
        <ImageModal
          src={src}
          alt={alt}
          onClose={() => setIsZoomed(false)}
        />
      )}
    </>
  )
}

interface ImageModalProps {
  src: string
  alt: string
  onClose: () => void
}

function ImageModal({ src, alt, onClose }: ImageModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Save the current scroll position
    const scrollY = window.scrollY
    const scrollX = window.scrollX

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    // Only add event listeners if we're in the browser
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent scrolling while modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = ''
        // Restore the scroll position after the modal closes
        requestAnimationFrame(() => {
          window.scrollTo(scrollX, scrollY)
        })
      }
    }
  }, [onClose])

  if (!mounted) return null

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          fontSize: '2rem',
          fontWeight: 'bold',
          color: 'white',
          background: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer',
          zIndex: 10000
        }}
        aria-label="Close modal"
      >
        ×
      </button>
      <img
        src={src}
        alt={alt}
        style={{
          maxWidth: '90%',
          maxHeight: '90%',
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
          border: '2px solid red', // Debug border - remove after testing
        }}
        onClick={(e) => e.stopPropagation()}
        onError={(e) => {
          console.error('Failed to load image:', src)
          console.error('Error event:', e)
        }}
        onLoad={(e) => {
          console.log('Image loaded successfully:', src)
          const img = e.target as HTMLImageElement
          console.log('Image dimensions:', img.naturalWidth, 'x', img.naturalHeight)
          console.log('Displayed dimensions:', img.width, 'x', img.height)
        }}
      />
    </div>
  )

  return createPortal(modalContent, document.body)
}