// lib/posts.js
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'posts')

// 1) Tüm yazıları metadata ile oku ve tarihe göre sırala
export function getSortedPostsData() {
  const fileNames = fs.readdirSync(postsDirectory)
  const allPosts = fileNames.map(fileName => {
    const slug = fileName.replace(/\.md$/, '')
    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data } = matter(fileContents)

    return {
      slug,
      ...data     // title, date, vs.
    }
  })
  return allPosts.sort((a, b) => (a.date < b.date ? 1 : -1))
}

// 2) Dinamik rota için slugs
export function getAllPostSlugs() {
  return fs.readdirSync(postsDirectory).map(fileName => ({
    params: { slug: fileName.replace(/\.md$/, '') }
  }))
}

// 3) Tek bir yazının tamamını al (HTML’e dönüştür)
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
    contentHtml,
    ...data
  }
}
