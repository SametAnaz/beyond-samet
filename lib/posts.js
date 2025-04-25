// lib/posts.js

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'posts')

/**
 * Reads all markdown files in /posts, parses front-matter,
 * and returns an array of post metadata sorted by date.
 */
export function getSortedPostsData() {
  const fileNames = fs.readdirSync(postsDirectory)
  const allPosts = fileNames.map(fileName => {
    const slug = fileName.replace(/\.md$/, '')
    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data } = matter(fileContents)

    return {
      slug,
      title: data.title,
      date: data.date,
      author: data.author,
      excerpt: data.excerpt
    }
  })

  return allPosts.sort((a, b) => (a.date < b.date ? 1 : -1))
}

/**
 * Returns list of slugs for dynamic routing.
 */
export function getAllPostSlugs() {
  return fs.readdirSync(postsDirectory).map(fileName => ({
    params: { slug: fileName.replace(/\.md$/, '') }
  }))
}

/**
 * Given a slug (filename), reads the markdown file,
 * parses front-matter and content, converts to HTML.
 */
export async function getPostData(slug) {
  const fullPath = path.join(postsDirectory, `${slug}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  const processedContent = await remark()
    .use(html)
    .process(content)
  const contentHtml = processedContent.toString()

  return {
    slug,
    title: data.title,
    date: data.date,
    author: data.author,
    excerpt: data.excerpt,
    contentHtml
  }
}
