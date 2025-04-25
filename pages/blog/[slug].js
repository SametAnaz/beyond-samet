// pages/blog/[slug].js

import React from "react";
import Head from "next/head";
import styles from "../../styles/blog-post.module.css";
import { getAllPostSlugs, getPostData } from "../../lib/posts";
import GiscusComments from "../../src/components/GiscusComments";

export async function getStaticPaths() {
  const paths = getAllPostSlugs();
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const postData = await getPostData(params.slug);
  return {
    props: { postData },
  };
}

export default function Post({ postData }) {
  return (
    <>
      <Head>
        {/* Use a single template string so <title> has a single child */}
        <title>{`${postData.title} – Beyond Samet`}</title>
      </Head>
      <article className={styles.article}>
        <h1 className={styles.title}>{postData.title}</h1>
        <div className={styles.date}>
          {new Date(postData.date).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
        />
        {/* Giscus Comments */}
        <GiscusComments
          repo="SametAnaz/beyond-samet"
          repoId="971767619"
          category="General"
          categoryId="44421397"
        />
      </article>
    </>
  );
}
