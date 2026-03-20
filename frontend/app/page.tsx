import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { formatPublishDate, getPosts } from "@/lib/wordpress";
import {
  MegaphoneIcon,
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const expertise = [
  {
    icon: MegaphoneIcon,
    iconClass: "expertise-icon-rose",
    title: "Strategic Communications",
    desc: "Developing data-driven communication frameworks and multi-channel campaign strategies aligned with organizational objectives.",
  },
  {
    icon: ChatBubbleLeftRightIcon,
    iconClass: "expertise-icon-sage",
    title: "Media Relations",
    desc: "Building and nurturing relationships with journalists, managing press conferences, and securing strategic media placements.",
  },
  {
    icon: PencilSquareIcon,
    iconClass: "expertise-icon-rose",
    title: "Content Strategy",
    desc: "Planning and writing clear content across channels, from press materials to social campaigns.",
  },
  {
    icon: ShieldCheckIcon,
    iconClass: "expertise-icon-charcoal",
    title: "Crisis Communications",
    desc: "Proactive crisis management with rapid response protocols, stakeholder communications, and reputation recovery strategies.",
  },
  {
    icon: GlobeAltIcon,
    iconClass: "expertise-icon-sage",
    title: "Advocacy & Campaigns",
    desc: "Designing advocacy campaigns targeting policymakers, community leaders, and youth populations for social impact.",
  },
  {
    icon: SparklesIcon,
    iconClass: "expertise-icon-rose",
    title: "Brand Strategy",
    desc: "Shaping brand identity and positioning through strategic messaging, visual storytelling, and audience engagement.",
  },
];

const metrics = [
  { value: "6+", label: "Years Experience" },
  { value: "30+", label: "Campaigns Delivered" },
  { value: "35%", label: "Avg. Engagement Increase" },
  { value: "4", label: "Organizations Served" },
];

const caseStudies = [
  {
    slug: "reach-out-cameroon",
    tags: ["Campaigns", "Content Strategy"],
    tagClass: "tag-rose",
    title: "Reach Out Cameroon",
    desc: "I led more than 30 multi-channel campaigns and helped raise engagement by 35% across key audiences.",
    visual: "ROC",
  },
  {
    slug: "paradigm-initiative",
    tags: ["Research", "Advocacy"],
    tagClass: "tag-sage",
    title: "Paradigm Initiative",
    desc: "I supported research, presented findings internationally, and helped strengthen visibility for digital rights work across Africa.",
    visual: "PI",
  },
  {
    slug: "rock-me-fabulous",
    tags: ["Social Media", "Brand"],
    tagClass: "tag-rose",
    title: "Rock Me Fabulous",
    desc: "Managed social platforms achieving 60% follower growth, boosted brand visibility through innovative campaigns and proactive crisis management.",
    visual: "RMF",
  },
  {
    slug: "psyeduc-global",
    tags: ["Nonprofit", "PR"],
    tagClass: "tag-sage",
    title: "PsyEduc Global Cameroon",
    desc: "Developed a comprehensive communication strategy increasing public engagement by 45%, managed social media and organized press conferences.",
    visual: "PG",
  },
];

const partners = [
  "Reach Out Cameroon",
  "Paradigm Initiative",
  "MTN Cameroon",
  "PsyEduc Global",
  "Rock Me Fabulous",
];

const testimonials = [
  {
    quote:
      "Working together felt seamless from start to finish. Our goals were understood quickly, the right questions were asked, and the final campaign exceeded expectations.",
    name: "Team Lead",
    role: "Reach Out Cameroon",
    avatar: "T",
  },
  {
    quote:
      "Our advocacy vision finally sounded clear and human. The messaging balanced strategy with empathy and gave us something we were proud to share.",
    name: "Program Director",
    role: "PsyEduc Global Cameroon",
    avatar: "P",
  },
];

export default async function HomePage() {
  const posts = await getPosts(3);

  return (
    <>
      {/* ══ HERO ══ */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="hero-status">
                <span className="hero-status-dot" aria-hidden="true" />
                Available for new opportunities
              </div>

              <h1 id="hero-heading" className="hero-title">
                Strategic
                <br />
                <span className="hero-title-accent">Communications</span>
                <br />
                Professional
              </h1>

              <p className="hero-desc">
                I build communication strategies and campaigns that help
                organizations speak clearly, earn trust, and create real impact.
              </p>

              <div className="hero-actions">
                <Link href="/contact" className="btn btn-primary btn-lg">
                  Start a Project
                </Link>
                <Link href="/case-studies" className="btn btn-outline btn-lg">
                  View Case Studies
                </Link>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-portrait">
                <span className="hero-portrait-text" aria-hidden="true">OE</span>
              </div>
              <div className="hero-stat is-top">
                <span className="hero-stat-label">Experience</span>
                <span className="hero-stat-value">6+ Years</span>
              </div>
              <div className="hero-stat is-bottom">
                <span className="hero-stat-label">Campaigns</span>
                <span className="hero-stat-value">30+ Done</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PARTNER LOGOS ══ */}
      <section aria-label="Organizations I have worked with">
        <div className="container">
          <div className="logo-cloud">
            {partners.map((p) => (
              <span key={p} className="logo-cloud-item">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ METRICS ══ */}
      <section aria-label="Key achievements">
        <div className="container">
          <div className="metrics-bar">
            {metrics.map((m) => (
              <div key={m.label} className="metric">
                <div className="metric-value">{m.value}</div>
                <div className="metric-label">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ EXPERTISE ══ */}
      <section className="section" aria-labelledby="expertise-heading">
        <div className="container">
          <div className="section-eyebrow" aria-hidden="true">Areas of Expertise</div>
          <h2 id="expertise-heading" className="section-title">
            What I Bring to the Table
          </h2>
          <p className="section-subtitle">
            Six years of hands-on work across strategy, media, and advocacy have
            taught me how to turn complex goals into clear communication.
          </p>

          <div className="expertise-grid" style={{ marginTop: "3rem" }}>
            {expertise.map((e) => (
              <div key={e.title} className="expertise-card">
                <div className={`expertise-icon ${e.iconClass}`}>
                  <e.icon width={20} height={20} aria-hidden="true" />
                </div>
                <h3>{e.title}</h3>
                <p>{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURED CASE STUDIES ══ */}
      <section
        className="section"
        style={{ background: "var(--color-cream-dark)" }}
        aria-labelledby="work-heading"
      >
        <div className="container">
          <div className="section-eyebrow" aria-hidden="true">Selected Work</div>
          <h2 id="work-heading" className="section-title">
            Case Studies
          </h2>
          <p className="section-subtitle">
            Real campaigns, real results. Here are some of the projects where I drove
            measurable impact through strategic communications.
          </p>

          <div className="case-study-grid" style={{ marginTop: "3rem" }}>
            {caseStudies.map((cs) => (
              <Link
                key={cs.slug}
                href={`/case-studies/${cs.slug}`}
                className="case-study-card"
                aria-label={`View case study: ${cs.title}`}
              >
                <div className="case-study-visual">
                  <span className="case-study-visual-text" aria-hidden="true">
                    {cs.visual}
                  </span>
                </div>
                <div className="case-study-body">
                  <div className="case-study-tags">
                    {cs.tags.map((t) => (
                      <span key={t} className={`tag ${cs.tagClass}`}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <h3>{cs.title}</h3>
                  <p>{cs.desc}</p>
                  <span className="case-study-link">
                    Read Case Study <span aria-hidden="true">&rarr;</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <Link href="/case-studies" className="btn btn-outline">
              View All Case Studies
            </Link>
          </div>
        </div>
      </section>

      {/* ══ PROCESS ══ */}
      <section className="section" aria-labelledby="process-heading">
        <div className="container">
          <div className="section-eyebrow" aria-hidden="true">My Process</div>
          <h2 id="process-heading" className="section-title">
            How I Work
          </h2>
          <p className="section-subtitle">
            My process moves from research to strategy to execution so the work stays focused and useful at every stage.
          </p>

          <div className="process-grid">
            <div className="process-step">
              <div className="process-num">01</div>
              <h3>Research &amp; Discovery</h3>
              <p>
                Understanding your audience, goals, and landscape through qualitative
                and quantitative research and stakeholder mapping.
              </p>
            </div>
            <div className="process-step">
              <div className="process-num">02</div>
              <h3>Strategy &amp; Planning</h3>
              <p>
                Developing data-driven communication frameworks, messaging
                architecture, and multi-channel campaign plans tailored to your
                objectives.
              </p>
            </div>
            <div className="process-step">
              <div className="process-num">03</div>
              <h3>Execute &amp; Measure</h3>
              <p>
                Launching campaigns, managing media relations, producing content, and
                measuring impact with care and consistency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="section" aria-labelledby="testimonials-heading">
        <div className="container">
          <div className="section-eyebrow" aria-hidden="true">Testimonials</div>
          <h2 id="testimonials-heading" className="section-title">
            What People Say
          </h2>

          <div className="testimonial-grid">
            {testimonials.map((t) => (
              <div key={t.name} className="testimonial-card">
                <blockquote className="testimonial-quote">{t.quote}</blockquote>
                <div className="testimonial-author">
                  <div className="testimonial-avatar" aria-hidden="true">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BLOG PREVIEW ══ */}
      <section
        className="section blog-section"
        style={{ background: "var(--color-cream-dark)" }}
        aria-labelledby="blog-heading"
      >
        <div className="container">
          <div className="blog-section-header">
            <div>
              <div className="section-eyebrow" aria-hidden="true">Latest Writing</div>
              <h2 id="blog-heading" className="section-title">
                From the Blog
              </h2>
              <p className="section-subtitle">
                Thoughts, insights and perspectives on communications, media and storytelling.
              </p>
            </div>
            <Link href="/blog" className="btn btn-outline">
              View All Articles
            </Link>
          </div>

          {posts.length > 0 ? (
            <>
              {/* Featured Post */}
              <Link href={`/blog/${posts[0].slug}`} className="blog-featured">
                <div className="blog-featured-visual">
                  <span className="blog-featured-visual-text" aria-hidden="true">✦</span>
                </div>
                <div className="blog-featured-body">
                  <span className="blog-featured-tag">Latest</span>
                  <h3 className="blog-featured-title">{posts[0].title}</h3>
                  <p className="blog-featured-excerpt">
                    {posts[0].excerpt.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()}
                  </p>
                  <div className="blog-featured-footer">
                    <div className="blog-featured-meta">
                      <div className="blog-featured-avatar" aria-hidden="true">
                        {posts[0].authorName.charAt(0)}
                      </div>
                      <div className="blog-featured-meta-text">
                        <strong>{posts[0].authorName}</strong>
                        <br />
                        {formatPublishDate(posts[0].date)}
                      </div>
                    </div>
                    <span className="blog-featured-read">
                      Read article <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </div>
              </Link>

              {/* Remaining Posts */}
              {posts.length > 1 && (
                <div className="post-grid">
                  {posts.slice(1).map((post) => (
                    <PostCard key={post.slug} post={post} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <p>No posts published yet. Check back for insights on strategic communications.</p>
            </div>
          )}
        </div>
      </section>

      {/* ══ CTA ══ */}
      <div className="container">
        <section className="cta-section" aria-labelledby="cta-heading">
          <div className="section-eyebrow" aria-hidden="true">Let&apos;s Connect</div>
          <h2 id="cta-heading" className="cta-title">
            Ready to Elevate Your Communications?
          </h2>
          <p className="cta-desc">
            Whether you need a strategic communications partner, a campaign
            specialist, or a full-time communications officer, I&apos;m here to help
            you connect with the audiences who matter most.
          </p>
          <Link href="/contact" className="btn btn-white btn-lg">
            Start a Conversation
          </Link>
        </section>
      </div>
    </>
  );
}
