import 'katex/dist/katex.min.css'
import '@/styles/print.css'

export const metadata = {
  title: 'Print - Practical Jobs-to-be-Done',
}

export default function PrintLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="print-layout light"
      style={{ background: 'white', color: '#1a1a1a' }}
    >
      {children}
    </div>
  )
}
