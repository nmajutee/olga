"use client";

import Image from "next/image";
import { useEffect, useCallback } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image: string;
  activity: string;
  role: string;
  impact: string;
}

interface PortfolioModalProps {
  item: PortfolioItem;
  labels: {
    modalActivity: string;
    modalRole: string;
    modalImpact: string;
    closeModal: string;
  };
  onClose: () => void;
}

export function PortfolioModal({ item, labels, onClose }: PortfolioModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return (
    <div
      className="portfolio-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      <div className="portfolio-modal">
        <button
          className="portfolio-modal-close"
          onClick={onClose}
          aria-label={labels.closeModal}
        >
          <XMarkIcon width={24} height={24} aria-hidden="true" />
        </button>

        <div className="portfolio-modal-visual">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.title}
              className="portfolio-modal-image"
              width={1600}
              height={900}
              sizes="(min-width: 768px) 640px, 100vw"
            />
          ) : (
            <div className="portfolio-modal-visual-inner">
              <span className="portfolio-modal-visual-text" aria-hidden="true">
                {item.title.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="portfolio-modal-body">
          <span className="portfolio-modal-category">{item.category}</span>
          <h2 className="portfolio-modal-title">{item.title}</h2>

          <div className="portfolio-modal-section">
            <h3>{labels.modalActivity}</h3>
            <p>{item.activity}</p>
          </div>

          <div className="portfolio-modal-section">
            <h3>{labels.modalRole}</h3>
            <p>{item.role}</p>
          </div>

          <div className="portfolio-modal-section">
            <h3>{labels.modalImpact}</h3>
            <p>{item.impact}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
