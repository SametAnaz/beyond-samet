// pages/_app.js

import "@/styles/globals.css";
import Layout from "../src/components/Layout";
import { ThemeProvider } from "next-themes";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      enableColorScheme={true}
    >
      <Layout>
        <SpeedInsights />
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  );
}
