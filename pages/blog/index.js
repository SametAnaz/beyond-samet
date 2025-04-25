// pages/blog/index.js
import React from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "../../styles/Blog.module.css";
import { getSortedPostsData } from "../../lib/posts";

export async function getStaticProps() {
  const allPosts = getSortedPostsData();
  return { props: { allPosts } };
}

export default function Blog({ allPosts }) {
  return (
    <>
      <Head>
        <title>Blog – Beyond Samet</title>
      </Head>
      <main className={styles.container}>
        <h1 className={styles.heading}>Blog Başlıkları</h1>
        <div className={styles.grid}>
          {allPosts.map(({ slug, title, date }) => (
            <Link
              href={`/blog/${slug}`}
              key={slug}
              className={styles.card}
            >
              <h3>{title}</h3>
              <time dateTime={date}>
                {new Date(date).toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
