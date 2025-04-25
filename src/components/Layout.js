// src/components/Layout.js

import React from "react";
import Head from "next/head";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <Navbar />
      </header>

      <main className="container">
        {children}
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} Samet Anaz
      </footer>
    </>
  );
}
