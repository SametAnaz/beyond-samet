// pages/blog/[slug].js

import React from "react";
import Head from "next/head";
import Giscus from "@giscus/react";               // ← default import
import styles from "../../styles/blog-post.module.css";
import { getAllPostSlugs, getPostData } from "../../lib/posts";

export async function getStaticPaths() {
  const paths = getAllPostSlugs();
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const postData = await getPostData(params.slug);
  return { props: { postData } };
}

export default function Post({ postData }) {
  return (
    <>
      <Head>
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
      </article>

      {/* Giscus ile Yorumlar */}
      <div className={styles.comments}>
        <Giscus
          repo="SametAnaz/beyond-samet"
          repoId="971767619"
          category="General"
          categoryId="44421397"
          mapping="pathname"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="bottom"
          theme="dark_dimmed"
          lang="tr"
        />
      </div>
    </>
  );
}
