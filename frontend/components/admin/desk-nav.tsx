"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Squares2X2Icon,
  DocumentTextIcon,
  RectangleStackIcon,
  PhotoIcon,
  InboxIcon,
  Bars3BottomLeftIcon,
  SwatchIcon,
  GlobeAltIcon,
  Cog6ToothIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import type { NavCounts } from "@/lib/dashboard";

type Section = {
  heading: string;
  links: Array<{
    href: string;
    label: string;
    icon: typeof Squares2X2Icon;
    exact?: boolean;
    badge?: number;
    tone?: "alert";
  }>;
};

export function DeskNav({ counts }: { counts: NavCounts }) {
  const pathname = usePathname();

  const sections: Section[] = [
    {
      heading: "Content",
      links: [
        { href: "/admin", label: "Overview", icon: Squares2X2Icon, exact: true },
        { href: "/admin/posts", label: "Articles", icon: DocumentTextIcon, badge: counts.posts || undefined },
        { href: "/admin/collections", label: "Pages & work", icon: RectangleStackIcon, badge: counts.collections || undefined },
        { href: "/admin/media", label: "Media", icon: PhotoIcon, badge: counts.media || undefined },
        {
          href: "/admin/messages",
          label: "Messages",
          icon: InboxIcon,
          badge: counts.unreadMessages || undefined,
          tone: counts.unreadMessages ? "alert" : undefined,
        },
      ],
    },
    {
      heading: "Site",
      links: [
        { href: "/admin/navigation", label: "Navigation", icon: Bars3BottomLeftIcon },
        { href: "/admin/appearance", label: "Appearance", icon: SwatchIcon },
        { href: "/admin/seo", label: "SEO & analytics", icon: GlobeAltIcon },
        { href: "/admin/settings", label: "Settings", icon: Cog6ToothIcon },
      ],
    },
    {
      heading: "You",
      links: [{ href: "/admin/profile", label: "Your profile", icon: UserCircleIcon }],
    },
  ];

  return (
    <nav className="flex-1">
      {sections.map((section) => (
        <div key={section.heading} className="admin-nav-group">
          <p className="admin-label-caps admin-nav-heading">{section.heading}</p>

          <div className="space-y-0.5">
            {section.links.map((link) => {
              const active = link.exact
                ? pathname === link.href
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="admin-nav-link"
                  aria-current={active ? "page" : undefined}
                >
                  <Icon aria-hidden="true" />
                  <span className="truncate">{link.label}</span>
                  {link.badge !== undefined && (
                    <span className="admin-nav-badge" data-tone={link.tone}>
                      {link.badge > 99 ? "99+" : link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

/** Horizontal variant for narrow screens, where the rail is hidden. */
export function DeskNavMobile({ counts }: { counts: NavCounts }) {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Overview", icon: Squares2X2Icon, exact: true },
    { href: "/admin/posts", label: "Articles", icon: DocumentTextIcon },
    { href: "/admin/collections", label: "Pages", icon: RectangleStackIcon },
    { href: "/admin/media", label: "Media", icon: PhotoIcon },
    { href: "/admin/messages", label: "Inbox", icon: InboxIcon, badge: counts.unreadMessages },
    { href: "/admin/settings", label: "Settings", icon: Cog6ToothIcon },
  ];

  return (
    <nav className="flex gap-1 overflow-x-auto border-b px-4 py-2 lg:hidden" style={{ borderColor: "var(--line)" }}>
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            className="admin-nav-link shrink-0"
            aria-current={active ? "page" : undefined}
          >
            <Icon aria-hidden="true" />
            <span>{link.label}</span>
            {link.badge ? <span className="admin-nav-badge" data-tone="alert">{link.badge}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
