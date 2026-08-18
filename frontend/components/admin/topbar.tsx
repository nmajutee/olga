"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlassIcon,
  EnvelopeIcon,
  BellIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

type Props = {
  userName: string;
  userEmail: string;
  avatarUrl: string | null;
  unreadMessages: number;
  hasDrafts: boolean;
};

export function Topbar({
  userName,
  userEmail,
  avatarUrl,
  unreadMessages,
  hasDrafts,
}: Props) {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  // ⌘F / Ctrl+F focuses search rather than the browser's find bar, which is
  // useless here — the content people want lives in the database, not the DOM.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "f") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const initials = userName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <header className="admin-topbar">
      <form
        className="admin-searchbox"
        onSubmit={(event) => {
          event.preventDefault();
          if (query.trim()) router.push(`/admin/posts?q=${encodeURIComponent(query.trim())}`);
        }}
      >
        <MagnifyingGlassIcon
          className="h-[1.0625rem] w-[1.0625rem] shrink-0"
          style={{ color: "var(--ink-4)" }}
          aria-hidden="true"
        />
        <input
          ref={searchRef}
          type="search"
          placeholder="Search articles"
          aria-label="Search articles"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <kbd className="admin-kbd hidden sm:inline-block">⌘F</kbd>
      </form>

      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          className="admin-btn admin-btn-outline admin-btn-sm hidden sm:inline-flex"
        >
          View site
          <ArrowTopRightOnSquareIcon aria-hidden="true" />
        </Link>

        <Link
          href="/admin/messages"
          className="admin-icon-btn"
          aria-label={
            unreadMessages ? `Messages, ${unreadMessages} unread` : "Messages"
          }
        >
          <EnvelopeIcon aria-hidden="true" />
          {unreadMessages > 0 && <span className="admin-dot" />}
        </Link>

        <Link
          href="/admin/posts?status=draft"
          className="admin-icon-btn"
          aria-label={hasDrafts ? "Notifications, drafts waiting" : "Notifications"}
        >
          <BellIcon aria-hidden="true" />
          {hasDrafts && <span className="admin-dot" />}
        </Link>

        <Link
          href="/admin/profile"
          className="admin-userchip"
        >
          <span className="admin-avatar admin-avatar-sm" aria-hidden="true">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" />
            ) : (
              initials || "?"
            )}
          </span>
          <span className="hidden min-w-0 leading-tight sm:block">
            <span className="block truncate text-[13px] font-semibold">{userName}</span>
            <span className="admin-micro block truncate">{userEmail}</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
