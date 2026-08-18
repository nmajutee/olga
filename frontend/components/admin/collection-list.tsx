"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Bars3Icon,
  ChevronUpIcon,
  ChevronDownIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/outline";
import { reorderContentAction } from "@/app/admin/actions";
import type { ContentItem } from "@/lib/collections";

/**
 * Ordering is done with explicit up/down controls rather than drag-and-drop:
 * it is keyboard-operable, works on touch, and the order here is the order on
 * the public site, so it needs to be exact rather than fluid.
 */
export function CollectionList({
  slug,
  items,
  emptyHint,
  label,
}: {
  slug: string;
  items: ContentItem[];
  emptyHint: string;
  label: string;
}) {
  const [order, setOrder] = useState(items);
  const [pending, startTransition] = useTransition();

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= order.length) return;

    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);

    startTransition(async () => {
      await reorderContentAction(slug, next.map((item) => item.id));
    });
  }

  if (order.length === 0) {
    return (
      <div className="admin-card">
        <div className="admin-empty">
          <span className="admin-empty-icon">
            <RectangleStackIcon />
          </span>
          <p className="admin-h2">Nothing here yet</p>
          <p className="admin-micro mx-auto mt-1.5 max-w-[46ch]">
            {emptyHint}
          </p>
          <Link
            href={`/admin/collections/${slug}/new`}
            className="admin-btn admin-btn-primary mt-5"
          >
            Add the first {label.toLowerCase()}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-card overflow-hidden">
      {order.map((item, index) => (
        <div key={item.id} className="admin-row">
          <span
            className="admin-row-icon overflow-hidden"
            style={{ background: "var(--sunken)", color: "var(--ink-4)" }}
            aria-hidden="true"
          >
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Bars3Icon />
            )}
          </span>

          <Link href={`/admin/collections/${slug}/${item.id}`} className="min-w-0 flex-1">
            <span className="block truncate font-semibold">{item.title}</span>
            <span className="admin-micro block truncate ">
              {item.summary || `/${item.slug}`}
            </span>
          </Link>

          <span className="admin-badge" data-tone={item.status}>
            {item.status === "published" ? "Live" : "Draft"}
          </span>

          <span className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              className="admin-tool"
              aria-label={`Move ${item.title} up`}
              disabled={index === 0 || pending}
              onClick={() => move(index, -1)}
            >
              <ChevronUpIcon aria-hidden="true" />
            </button>
            <button
              type="button"
              className="admin-tool"
              aria-label={`Move ${item.title} down`}
              disabled={index === order.length - 1 || pending}
              onClick={() => move(index, 1)}
            >
              <ChevronDownIcon aria-hidden="true" />
            </button>
          </span>
        </div>
      ))}
    </div>
  );
}
