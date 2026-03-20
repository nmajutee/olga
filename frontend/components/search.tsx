"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDictionary } from "@/i18n/dictionary-provider";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

type SearchResult = {
  title: string;
  description: string;
  href: string;
  category: string;
};

export function Search() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const dict = useDictionary();

  const locale = pathname.split("/")[1] || "en";
  const prefix = `/${locale}`;

  // Static searchable pages built from dictionary
  const getStaticPages = useCallback((): SearchResult[] => {
    const pages: SearchResult[] = [
      {
        title: dict.nav.home,
        description: dict.meta.siteDescription.slice(0, 100),
        href: prefix,
        category: dict.nav.home,
      },
      {
        title: dict.nav.about,
        description: dict.about.metaDescription.slice(0, 100),
        href: `${prefix}/about`,
        category: dict.nav.about,
      },
      {
        title: dict.nav.services,
        description: dict.services.metaDescription.slice(0, 100),
        href: `${prefix}/services`,
        category: dict.nav.services,
      },
      {
        title: dict.nav.caseStudies,
        description: dict.caseStudiesPage.metaDescription.slice(0, 100),
        href: `${prefix}/case-studies`,
        category: dict.nav.caseStudies,
      },
      {
        title: dict.nav.blog,
        description: dict.blog.metaDescription.slice(0, 100),
        href: `${prefix}/blog`,
        category: dict.nav.blog,
      },
      {
        title: dict.nav.contact,
        description: dict.contact.metaDescription.slice(0, 100),
        href: `${prefix}/contact`,
        category: dict.nav.contact,
      },
    ];

    // Add individual services
    dict.services.items.forEach((svc: { title: string; desc: string }) => {
      pages.push({
        title: svc.title,
        description: svc.desc.slice(0, 100),
        href: `${prefix}/services`,
        category: dict.nav.services,
      });
    });

    // Add case studies
    dict.caseStudiesPage.items.forEach(
      (cs: { slug: string; title: string; desc: string }) => {
        pages.push({
          title: cs.title,
          description: cs.desc.slice(0, 100),
          href: `${prefix}/case-studies/${cs.slug}`,
          category: dict.nav.caseStudies,
        });
      }
    );

    return pages;
  }, [dict, prefix]);

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setActiveIndex(-1);
      return;
    }

    const q = query.toLowerCase();
    const staticPages = getStaticPages();
    const matched = staticPages.filter(
      (page) =>
        page.title.toLowerCase().includes(q) ||
        page.description.toLowerCase().includes(q) ||
        page.category.toLowerCase().includes(q)
    );

    setResults(matched.slice(0, 8));
    setActiveIndex(-1);
  }, [query, getStaticPages]);

  // Open/close
  const openSearch = useCallback(() => {
    setOpen(true);
    setQuery("");
    setResults([]);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const closeSearch = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setActiveIndex(-1);
  }, []);

  // Navigate to result
  const goToResult = useCallback(
    (result: SearchResult) => {
      closeSearch();
      router.push(result.href);
    },
    [closeSearch, router]
  );

  // Keyboard shortcut (Ctrl/Cmd + K)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) closeSearch();
        else openSearch();
      }
      if (e.key === "Escape" && open) {
        closeSearch();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, openSearch, closeSearch]);

  // Arrow key navigation inside results
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
      e.preventDefault();
      goToResult(results[activeIndex]);
    }
  };

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        closeSearch();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, closeSearch]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const searchLabel = locale === "fr" ? "Rechercher" : "Search";
  const placeholderText =
    locale === "fr" ? "Rechercher des pages, services, articles…" : "Search pages, services, articles…";
  const noResultsText = locale === "fr" ? "Aucun résultat pour" : "No results for";
  const shortcutHint = locale === "fr" ? "pour rechercher" : "to search";

  return (
    <>
      {/* Search trigger button */}
      <button
        className="search-trigger"
        onClick={openSearch}
        aria-label={searchLabel}
        type="button"
      >
        <MagnifyingGlassIcon width={20} height={20} aria-hidden="true" />
      </button>

      {/* Search modal overlay */}
      {open && (
        <div className="search-overlay" role="dialog" aria-label={searchLabel} aria-modal="true">
          <div className="search-dialog" ref={dialogRef}>
            {/* Search input */}
            <div className="search-input-wrap">
              <MagnifyingGlassIcon
                width={20}
                height={20}
                className="search-input-icon"
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                type="search"
                className="search-input"
                placeholder={placeholderText}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              <button
                className="search-close"
                onClick={closeSearch}
                aria-label={locale === "fr" ? "Fermer" : "Close"}
                type="button"
              >
                <span className="search-close-key">ESC</span>
              </button>
            </div>

            {/* Results */}
            <div className="search-results">
              {query.trim() && results.length === 0 && (
                <div className="search-empty">
                  <MagnifyingGlassIcon
                    width={32}
                    height={32}
                    aria-hidden="true"
                    style={{ opacity: 0.3 }}
                  />
                  <p>
                    {noResultsText} &ldquo;<strong>{query}</strong>&rdquo;
                  </p>
                </div>
              )}

              {results.length > 0 && (
                <ul className="search-results-list" role="listbox">
                  {results.map((result, i) => (
                    <li
                      key={`${result.href}-${i}`}
                      role="option"
                      aria-selected={i === activeIndex}
                    >
                      <button
                        className={`search-result-item${i === activeIndex ? " search-result-active" : ""}`}
                        onClick={() => goToResult(result)}
                        type="button"
                      >
                        <div className="search-result-body">
                          <span className="search-result-category">
                            {result.category}
                          </span>
                          <span className="search-result-title">
                            {result.title}
                          </span>
                          <span className="search-result-desc">
                            {result.description}
                          </span>
                        </div>
                        <ArrowRightIcon
                          width={14}
                          height={14}
                          className="search-result-arrow"
                          aria-hidden="true"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {!query.trim() && (
                <div className="search-hint">
                  <p>
                    <kbd>↑</kbd> <kbd>↓</kbd> {locale === "fr" ? "naviguer" : "navigate"} &nbsp;
                    <kbd>↵</kbd> {locale === "fr" ? "sélectionner" : "select"} &nbsp;
                    <kbd>esc</kbd> {locale === "fr" ? "fermer" : "close"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
