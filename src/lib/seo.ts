// SEO Configuration and Utilities for LLM Toolkit

export const SEO_CONFIG = {
  baseUrl: "https://llm.traceback.in",
  siteName: "LLM Toolkit",
  defaultTitle: "LLM Toolkit - AI Model Calculator & Comparison Platform",
  defaultDescription:
    "Professional LLM toolkit with AI model price calculator, token counter, hardware requirements estimator, and comprehensive model comparison. Compare OpenAI GPT, Claude, Gemini, and 100+ LLM models.",
  defaultKeywords:
    "LLM calculator, AI model pricing, token calculator, GPT cost calculator, Claude pricing, Gemini cost, AI model comparison, LLM hardware requirements, language model tools, OpenAI calculator, Anthropic pricing, Google AI costs",
  twitterHandle: "@algogist",
  githubRepo: "https://github.com/enough-jainil/llm-wizard-toolkit",
  ogImage: "/og-image.jpg",
  themeColor: "#2563eb",
  language: "en-US",
  locale: "en_US",
};

export const PAGE_SEO = {
  home: {
    title:
      "LLM Toolkit - AI Model Calculator & Comparison Platform | llm.traceback.in",
    description:
      "Professional LLM toolkit with AI model price calculator, token counter, hardware requirements estimator, and comprehensive model comparison. Compare OpenAI GPT, Claude, Gemini, and 100+ LLM models.",
    keywords:
      "LLM calculator, AI model pricing, token calculator, GPT cost calculator, Claude pricing, Gemini cost, AI model comparison, LLM hardware requirements, language model tools",
    canonical: "/",
  },
  priceCalculator: {
    title: "LLM Price Calculator - Compare AI Model Costs | LLM Toolkit",
    description:
      "Calculate and compare costs for OpenAI GPT, Claude, Gemini, and 100+ AI models. Real-time pricing across all major LLM providers including usage estimation and batch pricing.",
    keywords:
      "LLM pricing, AI model costs, GPT calculator, Claude pricing, Gemini cost, OpenAI pricing, Anthropic cost, Google AI pricing, API cost calculator",
    canonical: "/?tab=price",
  },
  tokenCalculator: {
    title: "Token Calculator - Count LLM Tokens in Real-time | LLM Toolkit",
    description:
      "Count tokens in real-time for accurate LLM pricing and context management. Supports all major tokenizers including GPT, Claude, Gemini, and Llama tokenization.",
    keywords:
      "token counter, LLM tokens, tokenizer, context length, GPT tokens, Claude tokens, Gemini tokens, BPE tokenizer, tiktoken",
    canonical: "/?tab=tokens",
  },
  hardwareCalculator: {
    title: "Hardware Requirements Calculator for LLMs | LLM Toolkit",
    description:
      "Estimate hardware requirements for running Large Language Models locally. Calculate VRAM, RAM, and compute needs for LLM deployment and inference.",
    keywords:
      "LLM hardware, VRAM requirements, local AI, model deployment, GPU requirements, AI hardware, LLM inference, model hosting",
    canonical: "/?tab=hardware",
  },
  modelComparison: {
    title: "AI Model Comparison Tool - Compare 100+ LLMs | LLM Toolkit",
    description:
      "Compare 100+ AI models side-by-side including GPT-4, Claude 3, Gemini Pro, and more. Performance metrics, pricing, and feature comparison for informed decision making.",
    keywords:
      "AI model comparison, LLM comparison, GPT vs Claude, model benchmarks, AI performance, language model evaluation, model selection",
    canonical: "/?tab=compare",
  },
  notFound: {
    title: "Page Not Found - LLM Toolkit | AI Model Calculator",
    description:
      "The page you're looking for doesn't exist. Explore our LLM price calculator, token counter, hardware requirements, and model comparison tools.",
    keywords: "404, page not found, LLM tools, AI calculator",
    canonical: "/404",
    noIndex: true,
  },
} as const;

export const STRUCTURED_DATA = {
  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SEO_CONFIG.siteName,
    url: SEO_CONFIG.baseUrl,
    description:
      "Professional toolkit for Large Language Model calculations and comparisons",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SEO_CONFIG.baseUrl}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
    creator: {
      "@type": "Organization",
      name: SEO_CONFIG.siteName,
      url: SEO_CONFIG.baseUrl,
    },
    inLanguage: SEO_CONFIG.language,
    audience: {
      "@type": "Audience",
      audienceType: [
        "Developers",
        "Researchers",
        "AI Engineers",
        "Data Scientists",
      ],
    },
  },

  softwareApplication: {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SEO_CONFIG.siteName,
    description:
      "Professional LLM toolkit with AI model price calculator, token counter, hardware requirements estimator, and comprehensive model comparison for 100+ language models.",
    url: SEO_CONFIG.baseUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "LLM Price Calculator",
      "Token Calculator",
      "Hardware Requirements Calculator",
      "AI Model Comparison",
      "Multi-provider Support",
      "Real-time Cost Estimation",
    ],
    provider: {
      "@type": "Organization",
      name: SEO_CONFIG.siteName,
      url: SEO_CONFIG.baseUrl,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "312",
      bestRating: "5",
      worstRating: "1",
    },
    softwareVersion: "2.0.0",
    datePublished: "2024-01-01",
    dateModified: new Date().toISOString().split("T")[0],
    inLanguage: SEO_CONFIG.language,
    isAccessibleForFree: true,
    permissions: ["Free usage", "Open source"],
    supportingData: {
      "@type": "DataCatalog",
      name: "Supported AI Models",
      description: "Database of 100+ AI models with pricing and specifications",
    },
  },

  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SEO_CONFIG.siteName,
    url: SEO_CONFIG.baseUrl,
    logo: `${SEO_CONFIG.baseUrl}/logo-512x512.png`,
    description:
      "Professional platform for Large Language Model calculations, comparisons, and cost optimization",
    sameAs: [
      "https://x.com/algogist",
      "https://github.com/enough-jainil/llm-wizard-toolkit",
    ],
    foundingDate: "2024-01-01",
    address: {
      "@type": "PostalAddress",
      addressCountry: "Global",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      url: "https://github.com/enough-jainil/llm-wizard-toolkit/issues",
    },
  },

  breadcrumbList: {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SEO_CONFIG.baseUrl,
      },
    ],
  },
};

// Enhanced utility functions for SEO
export const updateMetaTag = (
  name: string,
  content: string,
  property?: boolean
) => {
  const selector = property
    ? `meta[property="${name}"]`
    : `meta[name="${name}"]`;
  let meta = document.querySelector(selector) as HTMLMetaElement;

  if (!meta) {
    meta = document.createElement("meta");
    if (property) {
      meta.setAttribute("property", name);
    } else {
      meta.setAttribute("name", name);
    }
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", content);
};

export const updateTitle = (title: string) => {
  document.title = title;

  // Also update og:title if it exists
  updateMetaTag("og:title", title, true);
  updateMetaTag("twitter:title", title, true);
};

export const updateDescription = (description: string) => {
  updateMetaTag("description", description);
  updateMetaTag("og:description", description, true);
  updateMetaTag("twitter:description", description, true);
};

export const updateKeywords = (keywords: string) => {
  updateMetaTag("keywords", keywords);
};

export const updateCanonical = (path: string) => {
  let canonical = document.querySelector(
    'link[rel="canonical"]'
  ) as HTMLLinkElement;

  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }

  canonical.setAttribute("href", `${SEO_CONFIG.baseUrl}${path}`);
};

export const addStructuredData = (data: object, id: string) => {
  // Remove existing structured data with the same ID
  const existing = document.querySelector(`script[data-id="${id}"]`);
  if (existing) {
    existing.remove();
  }

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.setAttribute("data-id", id);
  script.textContent = JSON.stringify(data, null, 0);
  document.head.appendChild(script);
};

export const updatePageSEO = (pageKey: keyof typeof PAGE_SEO) => {
  const pageSEO = PAGE_SEO[pageKey];

  updateTitle(pageSEO.title);
  updateDescription(pageSEO.description);
  updateKeywords(pageSEO.keywords);
  updateCanonical(pageSEO.canonical);

  // Update robots meta tag
  if ("noIndex" in pageSEO && pageSEO.noIndex) {
    updateMetaTag("robots", "noindex, nofollow");
  } else {
    updateMetaTag(
      "robots",
      "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
    );
  }

  // Update URL meta tags
  updateMetaTag("og:url", `${SEO_CONFIG.baseUrl}${pageSEO.canonical}`, true);
  updateMetaTag(
    "twitter:url",
    `${SEO_CONFIG.baseUrl}${pageSEO.canonical}`,
    true
  );
};

// Performance and accessibility utilities
export const addPreconnectLinks = (domains: string[]) => {
  domains.forEach((domain) => {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = domain;
    document.head.appendChild(link);
  });
};

export const addDNSPrefetchLinks = (domains: string[]) => {
  domains.forEach((domain) => {
    const link = document.createElement("link");
    link.rel = "dns-prefetch";
    link.href = domain;
    document.head.appendChild(link);
  });
};

export const addPrefetchLinks = (resources: string[]) => {
  resources.forEach((resource) => {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = resource;
    document.head.appendChild(link);
  });
};

// Mobile and accessibility enhancements
export const updateViewportMeta = () => {
  const viewport = document.querySelector(
    'meta[name="viewport"]'
  ) as HTMLMetaElement;
  if (viewport) {
    viewport.setAttribute(
      "content",
      "width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"
    );
  }
};

export const updateThemeColor = (lightColor: string, darkColor: string) => {
  // Remove existing theme-color meta tags
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((meta) => meta.remove());

  // Add new theme-color meta tags
  const lightMeta = document.createElement("meta");
  lightMeta.name = "theme-color";
  lightMeta.content = lightColor;
  lightMeta.media = "(prefers-color-scheme: light)";
  document.head.appendChild(lightMeta);

  const darkMeta = document.createElement("meta");
  darkMeta.name = "theme-color";
  darkMeta.content = darkColor;
  darkMeta.media = "(prefers-color-scheme: dark)";
  document.head.appendChild(darkMeta);
};

// Initialize enhanced SEO features
export const initSEO = () => {
  updateViewportMeta();
  updateThemeColor("#2563eb", "#1e40af");

  // Add performance hints
  addPreconnectLinks([
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com",
  ]);

  addDNSPrefetchLinks(["//cdn.gpteng.co", "//openrouter.ai"]);
};

export { SEO_CONFIG as default };
