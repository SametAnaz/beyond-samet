// pages/_app.js

import "@/styles/globals.css";
import Layout from "../src/components/Layout";
import { ThemeProvider } from "next-themes";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function App({ Component, pageProps }) {
  // Contact sayfası mı tespit edelim
  const isContact = Component.name === "Contact";

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      enableColorScheme={true}
    >
      <Layout>
        {/* Contact sayfasında SpeedInsights'ı atla */}
        {!isContact && <SpeedInsights />}

        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  );
}
