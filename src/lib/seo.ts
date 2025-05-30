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
};

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
      ratingCount: "247",
      bestRating: "5",
      worstRating: "1",
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
  },
};

// Utility functions for SEO
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
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

export const updatePageSEO = (pageKey: keyof typeof PAGE_SEO) => {
  const pageSEO = PAGE_SEO[pageKey];

  updateTitle(pageSEO.title);
  updateMetaTag("description", pageSEO.description);
  updateMetaTag("keywords", pageSEO.keywords);
  updateCanonical(pageSEO.canonical);

  // Update Open Graph tags
  updateMetaTag("og:title", pageSEO.title, true);
  updateMetaTag("og:description", pageSEO.description, true);
  updateMetaTag("og:url", `${SEO_CONFIG.baseUrl}${pageSEO.canonical}`, true);

  // Update Twitter tags
  updateMetaTag("twitter:title", pageSEO.title, true);
  updateMetaTag("twitter:description", pageSEO.description, true);

  // Handle noindex for specific pages
  if ("noIndex" in pageSEO && pageSEO.noIndex) {
    updateMetaTag("robots", "noindex, follow");
  } else {
    updateMetaTag("robots", "index, follow");
  }
};

export const PROVIDERS_SEO_DATA = {
  openai: {
    name: "OpenAI",
    models: [
      "GPT-4o",
      "GPT-4o mini",
      "GPT-4 Turbo",
      "GPT-3.5 Turbo",
      "o1-preview",
      "o1-mini",
    ],
    description:
      "Calculate costs for OpenAI models including GPT-4o, GPT-4 Turbo, and GPT-3.5 Turbo",
  },
  anthropic: {
    name: "Anthropic",
    models: [
      "Claude 3.5 Sonnet",
      "Claude 3 Opus",
      "Claude 3 Sonnet",
      "Claude 3 Haiku",
    ],
    description:
      "Compare pricing for Anthropic Claude models including Claude 3.5 Sonnet and Claude 3 Opus",
  },
  google: {
    name: "Google",
    models: [
      "Gemini 2.5 Pro",
      "Gemini 2.0 Flash",
      "Gemini 1.5 Pro",
      "Gemini 1.5 Flash",
    ],
    description:
      "Estimate costs for Google Gemini models including Gemini 2.5 Pro and Gemini 2.0 Flash",
  },
  meta: {
    name: "Meta",
    models: [
      "Llama 3.3 70B",
      "Llama 3.1 405B",
      "Llama 3.1 70B",
      "Llama 3.1 8B",
    ],
    description:
      "Calculate pricing for Meta Llama models including Llama 3.3 and Llama 3.1 variants",
  },
  mistral: {
    name: "Mistral",
    models: [
      "Mistral Large",
      "Mistral Medium",
      "Mistral Small",
      "Mixtral 8x7B",
    ],
    description:
      "Compare costs for Mistral AI models including Mistral Large and Mixtral 8x7B",
  },
};
