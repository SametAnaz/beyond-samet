// pages/_app.js

import "@/styles/globals.css";
import Layout from "../src/components/Layout";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function App({ Component, pageProps }) {
  return (
    <Layout>
      <SpeedInsights />
      <Component {...pageProps} />
    </Layout>
  );
}
