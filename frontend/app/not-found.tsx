import { NotFoundContent } from "@/components/not-found-content";

/**
 * Next renders this boundary for unmatched paths, including inside the
 * localised tree — so it has to be the good one, not a bare fallback.
 */
export default function NotFound() {
  return <NotFoundContent />;
}
