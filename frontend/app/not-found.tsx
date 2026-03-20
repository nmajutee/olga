import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section" style={{ textAlign: "center", paddingTop: "6rem", paddingBottom: "6rem" }}>
      <div className="container">
        <span className="section-eyebrow">404</span>
        <h1 className="section-title" style={{ marginTop: "1rem" }}>Page not found</h1>
        <p className="section-subtitle">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div style={{ marginTop: "2rem" }}>
          <Link href="/" className="btn btn-primary btn-lg">
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}