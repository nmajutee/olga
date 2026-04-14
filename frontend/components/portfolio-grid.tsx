"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import { PortfolioModal } from "./portfolio-modal";

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image: string;
  activity: string;
  role: string;
  impact: string;
}

interface PortfolioGridProps {
  items: PortfolioItem[];
  labels: {
    modalActivity: string;
    modalRole: string;
    modalImpact: string;
    closeModal: string;
  };
}

export function PortfolioGrid({ items, labels }: PortfolioGridProps) {
  const [activeItem, setActiveItem] = useState<PortfolioItem | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");

  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map((item) => item.category)));
    return ["All", ...cats];
  }, [items]);

  const filtered = activeFilter === "All"
    ? items
    : items.filter((item) => item.category === activeFilter);

  return (
    <>
      <div className="portfolio-filters">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`portfolio-filter-btn${activeFilter === cat ? " active" : ""}`}
            onClick={() => setActiveFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="portfolio-grid">
        {filtered.map((item) => (
          <button
            key={item.id}
            className="portfolio-card"
            onClick={() => setActiveItem(item)}
            aria-label={`View details: ${item.title}`}
          >
            <div className="portfolio-card-visual">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.title}
                  className="portfolio-card-image"
                  fill
                  sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 100vw"
                />
              ) : (
                <span className="portfolio-card-visual-text" aria-hidden="true">
                  {item.title.charAt(0)}
                </span>
              )}
            </div>
            <div className="portfolio-card-overlay">
              <span className="portfolio-card-category">{item.category}</span>
              <h3 className="portfolio-card-title">{item.title}</h3>
              <span className="portfolio-card-cta">
                View Details <span aria-hidden="true">→</span>
              </span>
            </div>
          </button>
        ))}
      </div>

      {activeItem && (
        <PortfolioModal
          item={activeItem}
          labels={labels}
          onClose={() => setActiveItem(null)}
        />
      )}
    </>
  );
}
