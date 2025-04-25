// src/components/GiscusComments.js

import { useEffect, useRef } from "react";

export default function GiscusComments() {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    // Eğer iframe zaten ekliyse tekrar ekleme
    if (ref.current.querySelector("iframe")) return;

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    // Repo ayarları
    script.setAttribute("data-repo", "SametAnaz/beyond-samet");
    script.setAttribute("data-repo-id", "971767619");
    // Discussion category ayarları
    script.setAttribute("data-category", "beyond-samet");
    script.setAttribute("data-category-id", "44421397");
    // Diğer opsiyonel özellikler
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", "dark_dimmed");
    script.setAttribute("crossorigin", "anonymous");

    ref.current.appendChild(script);
  }, []);

  return <div ref={ref} className="giscus-container" />;
}
