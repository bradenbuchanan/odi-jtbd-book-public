import { MDXComponents } from 'mdx/types'
import { BookImage } from './BookImage'
import { CodeBlock, RCodeBlock } from './CodeBlock'
import { ROutput } from './ROutput'
import { DownloadLink } from './DownloadLink'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Let prose handle most styling, just add specific enhancements
    a: ({ href, children }) => (
      <a 
        href={href} 
        className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-500 underline-offset-2 transition-colors duration-200"
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),
    // Custom image component with optimizations
    img: (props) => <BookImage {...props} />,
    BookImage,
    // Code block components
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
    pre: ({ children }) => <>{children}</>,
    CodeBlock,
    RCodeBlock,
    ROutput,
    DownloadLink,
    ...components,
  }
}