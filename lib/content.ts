import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface ChapterMetadata {
  title: string
  description: string
  order: number
  part: string
  tags: string[]
  author: string
  publishDate: string
  estimatedReadTime: string
  hasInteractiveContent: boolean
  slug: string
}

export interface Chapter {
  metadata: ChapterMetadata
  content: string
}

const contentDirectory = path.join(process.cwd(), 'content')

export function getAllChapters(): ChapterMetadata[] {
  const fileNames = fs.readdirSync(contentDirectory)
  const chapters = fileNames
    .filter((name) => name.endsWith('.mdx'))
    .map((name) => {
      const fullPath = path.join(contentDirectory, name)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data } = matter(fileContents)
      
      return {
        ...data,
        slug: name.replace(/\.mdx$/, ''),
      } as ChapterMetadata
    })
    .sort((a, b) => a.order - b.order)

  return chapters
}

export function getChapterBySlug(slug: string): Chapter | null {
  try {
    const fullPath = path.join(contentDirectory, `${slug}.mdx`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    return {
      metadata: {
        ...data,
        slug,
      } as ChapterMetadata,
      content,
    }
  } catch {
    return null
  }
}

export function getPartChapters(part: string): ChapterMetadata[] {
  return getAllChapters().filter((chapter) => chapter.part === part)
}

export function getAllParts(): string[] {
  const chapters = getAllChapters()
  const parts = [...new Set(chapters.map((chapter) => chapter.part))]
  return parts.filter(Boolean)
}