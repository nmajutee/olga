"use client";

import Image from "next/image";
import { useState } from "react";

interface AccordionImage {
  id: number;
  title: string;
  imageUrl: string;
}

const accordionItems: AccordionImage[] = [
  {
    id: 1,
    title: "Advocacy Training",
    imageUrl: "/images/portfolio/advocacy-training.jpg",
  },
  {
    id: 2,
    title: "Digital Rights",
    imageUrl: "/images/portfolio/digital-rights-speaking.jpg",
  },
  {
    id: 3,
    title: "Community Impact",
    imageUrl: "/images/portfolio/community-gbv-training.jpg",
  },
  {
    id: 4,
    title: "Youth Workshop",
    imageUrl: "/images/portfolio/youth-workshop.jpg",
  },
  {
    id: 5,
    title: "Humanitarian Work",
    imageUrl: "/images/portfolio/humanitarian-response.jpg",
  },
];

export function HeroAccordion() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="hero-accordion">
      {accordionItems.map((item, index) => (
        <div
          key={item.id}
          className={`hero-accordion-item ${index === activeIndex ? "active" : ""}`}
          onMouseEnter={() => setActiveIndex(index)}
          onFocus={() => setActiveIndex(index)}
          tabIndex={0}
          role="button"
          aria-label={item.title}
        >
          <Image
            src={item.imageUrl}
            alt={item.title}
            className="hero-accordion-image"
            fill
            sizes={index === activeIndex ? "(min-width: 1024px) 400px, (min-width: 768px) 360px, 300px" : "60px"}
            priority={index === 0}
          />
          <div className="hero-accordion-overlay" />
          <span className="hero-accordion-label">{item.title}</span>
        </div>
      ))}
    </div>
  );
}
