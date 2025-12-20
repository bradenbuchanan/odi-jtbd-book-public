import { getAllChapters, getChapterBySlug } from '../../../../lib/content'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import TableOfContents from '@/components/TableOfContents'
import OnThisPage from '@/components/OnThisPage'
import { BookImage } from '@/components/BookImage'
import { CodeBlock, RCodeBlock } from '@/components/CodeBlock'
import { ROutput } from '@/components/ROutput'
import { DownloadLink } from '@/components/DownloadLink'
import { ThemeToggle } from '@/components/ThemeToggle'
import { SidebarProvider } from '@/contexts/SidebarContext'
import { SidebarWrapper } from '@/components/SidebarWrapper'
import { ReadingProgress } from '@/components/ReadingProgress'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const chapters = getAllChapters()
  return chapters.map((chapter) => ({
    slug: chapter.slug,
  }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const chapter = getChapterBySlug(slug)
  
  if (!chapter) {
    return {
      title: 'Chapter Not Found',
      description: 'The requested chapter could not be found.',
    }
  }

  return {
    title: chapter.metadata.title,
    description: chapter.metadata.description,
  }
}

export default async function ChapterPage({ params }: PageProps) {
  const { slug } = await params
  const chapter = getChapterBySlug(slug)
  const allChapters = getAllChapters()

  if (!chapter) {
    notFound()
  }

  const currentIndex = allChapters.findIndex(ch => ch.slug === slug)
  const previousChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null

  return (
    <SidebarProvider>
      <ReadingProgress />
      <SidebarWrapper>
        <TableOfContents chapters={allChapters} currentSlug={slug} />
        
        <div className="main-column-wrapper">
          <main className="main-content-area">
        <ThemeToggle />
        <article className="chapter-article">
          {/* Chapter metadata */}
          <div className="chapter-metadata">
            <div className="chapter-metadata-info">
              <span className="chapter-part-badge">
                {chapter.metadata.part}
              </span>
            </div>
          </div>

          <h1 className="chapter-title">
            {chapter.metadata.title}
          </h1>
          
          {chapter.metadata.description && (
            <p className="chapter-description">
              {chapter.metadata.description}
            </p>
          )}
          
          <div className="prose dark:prose-invert">
            <MDXRemote
              source={chapter.content}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkMath],
                  rehypePlugins: [rehypeKatex],
                },
              }}
              components={{
                BookImage,
                CodeBlock,
                RCodeBlock,
                ROutput,
                DownloadLink,
                a: ({ href, children, ...props }) => {
                  // Check if it's an external link
                  const isExternal = href && (href.startsWith('http://') || href.startsWith('https://'))
                  
                  if (isExternal) {
                    return (
                      <a 
                        href={href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        {...props}
                      >
                        {children}
                      </a>
                    )
                  }
                  
                  // Internal link - keep default behavior
                  return <a href={href} {...props}>{children}</a>
                },
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '')
                  return match ? (
                    <CodeBlock className={className} {...props}>
                      {String(children).replace(/\n$/, '')}
                    </CodeBlock>
                  ) : (
                    <code className="px-1.5 py-0.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded font-mono" {...props}>
                      {children}
                    </code>
                  )
                },
                pre: ({ children }) => <>{children}</>
              }}
            />
          </div>
        </article>

        <nav className="chapter-navigation">
          <div>
            {previousChapter && (
              <a
                href={`/book/${previousChapter.slug}`}
                className="chapter-nav-link previous"
              >
                <svg className="chapter-nav-icon mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <div>
                  <div className="chapter-nav-label">Previous</div>
                  <div className="chapter-nav-title">
                    {previousChapter.title}
                  </div>
                </div>
              </a>
            )}
          </div>
          
          <div>
            {nextChapter && (
              <a
                href={`/book/${nextChapter.slug}`}
                className="chapter-nav-link next"
              >
                <div className="text-right">
                  <div className="chapter-nav-label">Next</div>
                  <div className="chapter-nav-title">
                    {nextChapter.title}
                  </div>
                </div>
                <svg className="chapter-nav-icon ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            )}
          </div>
        </nav>
        </main>
        </div>

        <OnThisPage />
      </SidebarWrapper>
    </SidebarProvider>
  )
}