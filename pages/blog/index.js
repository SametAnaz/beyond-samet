import React from 'react'
import Link from 'next/link'
import { getSortedPostsData } from '../../lib/posts'

export async function getStaticProps() {
  const allPosts = getSortedPostsData()
  return { props: { allPosts } }
}

export default function Blog({ allPosts }) {
  return (
    <section className="blog-list container">
      <h1>Blog Başlıkları</h1>
      <ul>
        {allPosts.map(({ slug, date, title }) => (
          <li key={slug}>
            <Link href={`/blog/${slug}`}>{title}</Link>
            <br />
            <small>
              {new Date(date).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </small>
          </li>
        ))}
      </ul>
    </section>
  )
}
