"use client";

import { useEffect, useRef, useState } from "react";
import {
  BuildingOffice2Icon,
  CheckBadgeIcon,
  AcademicCapIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

const statIcons = [BuildingOffice2Icon, CheckBadgeIcon, AcademicCapIcon, HeartIcon];

interface StatItem {
  value: string;
  suffix: string;
  label: string;
}

export function StatsCounter({ stats }: { stats: StatItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="stats-grid" ref={ref}>
      {stats.map((stat, i) => {
        const Icon = statIcons[i % statIcons.length];
        return (
          <div key={stat.label} className="stat-card">
            <div className="stat-icon" aria-hidden="true">
              <Icon width={24} height={24} />
            </div>
            <div className="stat-value">
              {visible ? <AnimatedNumber target={parseInt(stat.value)} /> : "0"}
              <span className="stat-suffix">{stat.suffix}</span>
            </div>
            <div className="stat-label">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function AnimatedNumber({ target }: { target: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), target);
      setValue(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target]);

  return <>{value.toLocaleString()}</>;
}
