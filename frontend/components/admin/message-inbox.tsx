"use client";

import { useState, useTransition } from "react";
import {
  InboxIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { markMessageAction, deleteMessageAction } from "@/app/admin/actions";
import { relativeTime } from "@/lib/activity";
import type { Message } from "@/lib/messages";

export function MessageInbox({ messages }: { messages: Message[] }) {
  const [selected, setSelected] = useState<Message | null>(messages[0] ?? null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [pending, startTransition] = useTransition();

  const visible = filter === "unread" ? messages.filter((m) => !m.readAt) : messages;

  function open(message: Message) {
    setSelected(message);
    if (!message.readAt) {
      startTransition(async () => {
        await markMessageAction(message.id, true);
      });
    }
  }

  if (messages.length === 0) {
    return (
      <div className="admin-card">
        <div className="admin-empty">
          <span className="admin-empty-icon">
            <InboxIcon />
          </span>
          <p className="admin-h2">No enquiries yet</p>
          <p className="admin-micro mx-auto mt-1.5 max-w-[52ch]">
            When someone fills in the contact form, the message is stored here as well as emailed —
            so an email outage never loses a client enquiry.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[21rem_minmax(0,1fr)]">
      <div className="admin-card overflow-hidden">
        <div className="border-b p-3" style={{ borderColor: "var(--line-soft)" }}>
          <div className="admin-segment" role="tablist" aria-label="Filter messages">
            {(["all", "unread"] as const).map((option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-current={filter === option}
                className="admin-segment-item"
                onClick={() => setFilter(option)}
              >
                {option === "all" ? "All" : "Unread"}
                <span className="admin-segment-count">
                  {option === "all"
                    ? messages.length
                    : messages.filter((m) => !m.readAt).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[32rem] overflow-y-auto">
          {visible.map((message) => (
            <button
              key={message.id}
              type="button"
              onClick={() => open(message)}
              className="admin-row w-full text-left"
              style={selected?.id === message.id ? { background: "var(--blue-soft)" } : undefined}
            >
              <span className="admin-avatar" aria-hidden="true">
                {message.name.charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span
                    className="truncate text-sm"
                    style={{ fontWeight: message.readAt ? 500 : 700 }}
                  >
                    {message.name}
                  </span>
                  {!message.readAt && (
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: "var(--blue)" }}
                      aria-label="Unread"
                    />
                  )}
                </span>
                <span className="admin-micro block truncate ">
                  {message.inquiry || "Enquiry"} · {relativeTime(message.createdAt)}
                </span>
              </span>
            </button>
          ))}

          {visible.length === 0 && (
            <p className="p-6 text-center text-sm" style={{ color: "var(--ink-3)" }}>
              Nothing unread.
            </p>
          )}
        </div>
      </div>

      {selected && (
        /* Flex column with a floor, so a one-line enquiry does not leave the
           panel stunted beside a tall message list. */
        <div className="admin-card flex min-h-[26rem] flex-col">
          <div className="admin-card-head items-start">
            <div className="min-w-0">
              <h2 className="admin-h2 truncate">{selected.name}</h2>
              <p className="mt-0.5 truncate text-sm" style={{ color: "var(--ink-3)" }}>
                {selected.email}
                {selected.company && ` · ${selected.company}`}
              </p>
            </div>
            <span className="admin-badge shrink-0" data-tone={selected.emailed ? "good" : "warn"}>
              {selected.emailed ? "Emailed" : "Not emailed"}
            </span>
          </div>

          <div className="flex-1 px-5">
            {/* Label above value. Three facts run together on one line read as
                a sentence, not as fields. */}
            <dl
              className="grid grid-cols-3 gap-4 border-b py-4"
              style={{ borderColor: "var(--line-soft)" }}
            >
              {[
                { label: "Enquiry type", value: selected.inquiry || "—" },
                { label: "Language", value: selected.locale.toUpperCase() },
                { label: "Received", value: relativeTime(selected.createdAt) },
              ].map((fact) => (
                <div key={fact.label} className="min-w-0">
                  <dt className="admin-label-caps">{fact.label}</dt>
                  <dd className="mt-1 truncate text-[14px] font-medium capitalize">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Constrained measure: a short enquiry stretched across the full
                panel is harder to read than one set to a normal column. */}
            <p className="admin-body max-w-[70ch] whitespace-pre-wrap py-6 leading-relaxed">
              {selected.message}
            </p>
          </div>

          {/* Actions grouped by intent: what you do with the enquiry on the
              left, the irreversible one held apart on the right. */}
          <div
            className="mt-auto flex flex-wrap items-center gap-2 border-t p-4"
            style={{ borderColor: "var(--line-soft)" }}
          >
            <a
              href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.inquiry || "your enquiry"}`)}`}
              className="admin-btn admin-btn-primary"
            >
              <EnvelopeIcon aria-hidden="true" />
              Reply
            </a>

            <button
              type="button"
              className="admin-btn admin-btn-outline"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await markMessageAction(selected.id, !selected.readAt);
                  setSelected({
                    ...selected,
                    readAt: selected.readAt ? null : new Date().toISOString(),
                  });
                })
              }
            >
              <EnvelopeOpenIcon aria-hidden="true" />
              Mark {selected.readAt ? "unread" : "read"}
            </button>

            {selected.pageUrl && (
              <a
                href={selected.pageUrl}
                target="_blank"
                rel="noreferrer"
                className="admin-btn admin-btn-ghost"
              >
                <ArrowTopRightOnSquareIcon aria-hidden="true" />
                Sent from
              </a>
            )}

            <button
              type="button"
              className="admin-btn admin-btn-danger ml-auto"
              disabled={pending}
              onClick={() => {
                if (!window.confirm(`Delete the message from ${selected.name}?`)) return;
                startTransition(async () => {
                  await deleteMessageAction(selected.id);
                  setSelected(null);
                });
              }}
            >
              <TrashIcon aria-hidden="true" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
