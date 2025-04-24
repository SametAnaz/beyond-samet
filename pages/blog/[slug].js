// pages/blog/[slug].js
import React from 'react'
import styles from '../../styles/blog-post.module.css'
import { getAllPostSlugs, getPostData } from '../../lib/posts'

export async function getStaticPaths() {
  const paths = getAllPostSlugs()
  return {
    paths,
    fallback: false
  }
}

export async function getStaticProps({ params }) {
  const postData = await getPostData(params.slug)
  return {
    props: { postData }
  }
}

export default function Post({ postData }) {
  return (
    <article className={styles.container}>
      <h1 className={styles.title}>{postData.title}</h1>
      <p className={styles.author}>Yazar: {postData.author}</p>
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
      />
      <div className={styles.date}>
        {new Date(postData.date).toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })}
      </div>
    </article>
  )
}
