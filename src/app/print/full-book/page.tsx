import { getAllChapters, getChapterBySlug } from '../../../../lib/content'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { CodeBlock, RCodeBlock } from '@/components/CodeBlock'
import { ROutput } from '@/components/ROutput'
import { DownloadLink } from '@/components/DownloadLink'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

// Print-friendly image component that uses regular img tags (no lazy loading)
function PrintBookImage({
  src,
  alt,
  caption,
  width = 600,
  height = 400,
}: {
  src: string
  alt: string
  caption?: string
  width?: number
  height?: number
  standalone?: boolean
  zoomable?: boolean
}) {
  return (
    <figure style={{ margin: '1.5em 0', textAlign: 'center' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        style={{
          maxWidth: '100%',
          height: 'auto',
          borderRadius: '8px',
        }}
        loading="eager"
      />
      {caption && (
        <figcaption style={{
          marginTop: '0.5em',
          fontSize: '0.9em',
          color: '#666',
          fontStyle: 'italic',
        }}>
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

export const metadata = {
  title: 'Practical Jobs-to-be-Done - Full Book',
  description: 'Complete book: Practical Jobs-to-be-Done with Outcome-Driven Innovation',
}

export default async function PrintFullBookPage() {
  const allChapters = getAllChapters()

  // Get full content for each chapter
  const chaptersWithContent = allChapters.map(chapterMeta => {
    const chapter = getChapterBySlug(chapterMeta.slug)
    return chapter
  }).filter(Boolean)

  return (
    <div style={{
      maxWidth: '750px',
      margin: '0 auto',
      padding: '40px 50px',
      background: 'white',
      color: '#1a1a1a',
    }}>
      {/* Cover Page - Book Cover Image */}
      <div className="page-break-after" style={{
        textAlign: 'center',
        paddingTop: '100px',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/book/Introduction/JTBDODIBookCover.png"
          alt="Practical Jobs-to-be-Done Book Cover"
          style={{
            maxWidth: '100%',
            maxHeight: '600px',
            width: 'auto',
            height: 'auto',
          }}
        />
      </div>

      {/* Table of Contents */}
      <div className="page-break-after">
        <h2 style={{
          fontSize: '24pt',
          marginBottom: '24px',
          borderBottom: '3px solid #0F766E',
          paddingBottom: '12px',
          color: '#1a1a1a',
          fontWeight: 600,
        }}>
          Table of Contents
        </h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {allChapters.filter(ch => ch.title).map((chapter, idx) => {
            const title = chapter.title || ''
            const isSection = title.includes('Section') && title.includes('Overview')
            const isChapter = title.startsWith('Chapter')
            return (
              <li key={chapter.slug} style={{
                padding: '10px 0',
                borderBottom: '1px solid #e5e7eb',
                color: '#1a1a1a',
                fontSize: '11pt',
                paddingLeft: isChapter ? '24px' : '0',
                fontWeight: isSection ? 600 : 400,
              }}>
                <span style={{ color: '#6a6a6a', marginRight: '12px' }}>{idx + 1}.</span>
                {title}
              </li>
            )
          })}
        </ul>
      </div>

      {/* All Chapters */}
      {chaptersWithContent.map((chapter, index) => (
        <div
          key={chapter!.metadata.slug}
          className="page-break-before"
          style={{
            paddingTop: '40px',
            paddingBottom: '60px',
          }}
        >
          {/* Chapter Header */}
          <div style={{
            marginBottom: '40px',
            paddingBottom: '20px',
            borderBottom: '3px solid #0F766E',
          }}>
            <div style={{
              fontSize: '10pt',
              color: '#0F766E',
              marginBottom: '8px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {chapter!.metadata.part}
            </div>
            <h1 style={{
              fontSize: '26pt',
              fontWeight: 700,
              margin: '0 0 12px 0',
              color: '#1a1a1a',
              lineHeight: 1.2,
            }}>
              {chapter!.metadata.title}
            </h1>
            {chapter!.metadata.description && (
              <p style={{
                fontSize: '11pt',
                color: '#4a4a4a',
                margin: 0,
                lineHeight: 1.5,
              }}>
                {chapter!.metadata.description}
              </p>
            )}
          </div>

          {/* Chapter Content */}
          <div className="prose">
            <MDXRemote
              source={chapter!.content}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkMath],
                  rehypePlugins: [rehypeKatex],
                },
              }}
              components={{
                BookImage: PrintBookImage,
                CodeBlock,
                RCodeBlock,
                ROutput,
                DownloadLink,
                a: ({ href, children, ...props }) => {
                  return (
                    <a
                      href={href}
                      style={{ color: '#0F766E', textDecoration: 'underline' }}
                      {...props}
                    >
                      {children}
                    </a>
                  )
                },
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '')
                  return match ? (
                    <CodeBlock className={className} {...props}>
                      {String(children).replace(/\n$/, '')}
                    </CodeBlock>
                  ) : (
                    <code style={{
                      backgroundColor: '#f3f4f6',
                      color: '#1a1a1a',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.9em',
                      fontFamily: 'monospace',
                    }} {...props}>
                      {children}
                    </code>
                  )
                },
                pre: ({ children }) => <>{children}</>
              }}
            />
          </div>
        </div>
      ))}

      {/* Final page */}
      <div className="page-break-before" style={{
        textAlign: 'center',
        paddingTop: '250px'
      }}>
        <p style={{ fontSize: '14pt', color: '#4a4a4a', marginBottom: '16px' }}>
          End of Book
        </p>
        <p style={{ fontSize: '11pt', color: '#6a6a6a' }}>
          Practical Jobs-to-be-Done by Braden Buchanan
        </p>
      </div>
    </div>
  )
}
