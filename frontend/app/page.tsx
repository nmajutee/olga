import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { PortfolioGrid } from "@/components/portfolio-grid";
import { StatsCounter } from "@/components/stats-counter";
import { formatPublishDate, getPosts } from "@/lib/wordpress";
import {
  ChatBubbleLeftRightIcon,
  NewspaperIcon,
  PencilSquareIcon,
  DocumentMagnifyingGlassIcon,
  AcademicCapIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";

const expertise = [
  {
    icon: ChatBubbleLeftRightIcon,
    iconClass: "expertise-icon-rose",
    title: "Strategic Communications",
    desc: "I develop and implement comprehensive communication strategies to enhance brand visibility and deliver impactful messages across platforms.",
  },
  {
    icon: NewspaperIcon,
    iconClass: "expertise-icon-sage",
    title: "Media Relations & Press",
    desc: "I cultivate relationships with journalists and media houses, draft press releases, organize press conferences, and manage crisis communications.",
  },
  {
    icon: PencilSquareIcon,
    iconClass: "expertise-icon-rose",
    title: "Content Creation",
    desc: "I author high-impact content pieces including newsletters, reports, articles, and social media posts that boost stakeholder engagement.",
  },
  {
    icon: DocumentMagnifyingGlassIcon,
    iconClass: "expertise-icon-charcoal",
    title: "Research & Documentation",
    desc: "I conduct qualitative and quantitative research, literature reviews, and present findings at national and international conferences.",
  },
  {
    icon: AcademicCapIcon,
    iconClass: "expertise-icon-sage",
    title: "Training & Capacity Building",
    desc: "I design and deliver training sessions on communication ethics, media literacy, and effective advocacy techniques for staff and communities.",
  },
  {
    icon: MegaphoneIcon,
    iconClass: "expertise-icon-rose",
    title: "Advocacy & Campaigns",
    desc: "I spearhead multi-channel campaigns targeting diverse audiences, forging partnerships with NGOs, government bodies, and civil society organizations.",
  },
];

const stats = [
  { value: "6", suffix: "+", label: "Years of Experience" },
  { value: "30", suffix: "+", label: "Campaigns Led" },
  { value: "100", suffix: "+", label: "Content Pieces Published" },
  { value: "800", suffix: "+", label: "People Reached" },
];

const portfolioItems = [
  {
    id: "advocacy-training",
    title: "Advocacy & Training",
    category: "Workshop",
    image: "/images/portfolio/advocacy-training.jpg",
    activity: "Facilitated multi-day advocacy training workshops focused on equipping community leaders with the skills to champion human rights and influence local policy.",
    role: "Lead Facilitator & Trainer",
    impact: "Participants developed actionable advocacy plans that were later presented to local government bodies, resulting in increased dialogue between communities and policymakers.",
  },
  {
    id: "digital-rights-panel",
    title: "Digital Rights Panel",
    category: "Panel Discussion",
    image: "/images/portfolio/digital-rights-panel.jpg",
    activity: "Served as a panelist at a regional forum on digital rights, discussing internet freedom, data privacy, and the digital divide across African nations.",
    role: "Panelist & Speaker",
    impact: "The discussion generated cross-sector commitments to support digital inclusion policies and raised awareness among 200+ attendees about threats to online freedoms.",
  },
  {
    id: "community-gbv-training",
    title: "Community Training on GBV",
    category: "Community Training",
    image: "/images/portfolio/community-gbv-training.jpg",
    activity: "Organized and led community training sessions with men and boys focused on understanding, preventing, and responding to gender-based violence.",
    role: "Organizer & Trainer",
    impact: "Over 150 men participated across multiple sessions, leading to the formation of local male advocacy groups that continue to champion gender equity in their communities.",
  },
  {
    id: "youth-workshop",
    title: "Youth Empowerment Workshop",
    category: "Workshop",
    image: "/images/portfolio/youth-workshop.jpg",
    activity: "Designed and facilitated youth empowerment workshops centered on civic engagement, digital literacy, and leadership development for young people.",
    role: "Workshop Designer & Facilitator",
    impact: "Over 100 young people gained practical skills in advocacy, digital tools, and community organizing that they continue to apply in their local contexts.",
  },
  {
    id: "humanitarian-response",
    title: "Humanitarian Response Coordination",
    category: "Program Facilitation",
    image: "/images/portfolio/humanitarian-response.jpg",
    activity: "Coordinated community-level humanitarian response programs, ensuring that affected populations were reached with timely information, resources, and support.",
    role: "Program Coordinator & Facilitator",
    impact: "Streamlined communication between field teams and communities, improving response times and ensuring more equitable distribution of resources to vulnerable populations.",
  },
  {
    id: "media-literacy",
    title: "Media Literacy Campaign",
    category: "Campaign",
    image: "/images/portfolio/media-literacy.jpg",
    activity: "Led a media literacy campaign to help community members identify misinformation, understand their digital rights, and engage responsibly with online platforms.",
    role: "Campaign Lead & Trainer",
    impact: "The campaign reached over 500 community members through workshops and social media outreach, contributing to more informed and critical engagement with digital media.",
  },
];

const testimonials = [
  {
    quote:
      "Working together felt seamless from start to finish. Our goals were understood quickly, the right questions were asked, and the final campaign exceeded expectations.",
    name: "Team Lead",
    role: "International Development Organization",
    avatar: "T",
  },
  {
    quote:
      "Our advocacy vision finally sounded clear and human. The messaging balanced strategy with empathy and gave us something we were proud to share.",
    name: "Program Director",
    role: "Mental Health Advocacy Organization",
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
                Available for work
              </div>

              <h1 id="hero-heading" className="hero-title">
                Humanitarian &amp;{" "}
                <span className="hero-title-accent">Social Impact</span>{" "}
                Professional
              </h1>

              <p className="hero-desc">
                With 6+ years of experience in strategic communications, I develop
                impactful campaigns, manage media relations, facilitate trainings,
                and lead advocacy initiatives that create real change in communities
                across Africa.
              </p>

              <div className="hero-actions">
                <Link href="/contact" className="btn btn-primary btn-lg">
                  Get in Touch
                </Link>
                <Link href="/portfolio" className="btn btn-outline btn-lg" style={{ borderColor: "rgba(255,255,255,0.4)", color: "white" }}>
                  View My Work
                </Link>
              </div>
            </div>

            <div className="hero-portrait">
              <img
                src="/images/hero.jpg"
                alt="Olga Emma Elume"
                className="hero-portrait-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══ MY STORY / MISSION / VISION ══ */}
      <section className="section" style={{ background: "var(--color-cream-dark)" }} aria-labelledby="mission-heading">
        <div className="container">
          <h2 id="mission-heading" className="section-title">
            My Story, Mission &amp; Vision
          </h2>

          <div className="mission-grid">
            <div className="mission-card">
              <div className="mission-card-icon mission-icon-rose" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h1m8-9v1m8 8h1M5.6 5.6l.7.7m12.1-.7l-.7.7"/><path d="M9 16a5 5 0 1110 0v1H9v-1z"/><path d="M9 17h6v4H9z"/></svg>
              </div>
              <h3>My Story</h3>
              <p>I have spent the last 6+ years building campaigns, managing media relationships, and creating content that people can actually connect with. I know how to adjust the message for different audiences and keep the work grounded in real people and real issues.</p>
            </div>
            <div className="mission-card">
              <div className="mission-card-icon mission-icon-rose" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="11"/></svg>
              </div>
              <h3>My Mission</h3>
              <p>My mission is to use communication, advocacy, and learning spaces to help people feel informed, included, and heard.</p>
            </div>
            <div className="mission-card">
              <div className="mission-card-icon mission-icon-rose" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
              <h3>My Vision</h3>
              <p>I want to be part of a world where digital rights are protected, gender equity is taken seriously, and humanitarian work is shaped by the people closest to the issue.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ EXPERTISE (Services) ══ */}
      <section className="section" aria-labelledby="expertise-heading">
        <div className="container">
          <h2 id="expertise-heading" className="section-title">
            What I Do
          </h2>
          <p className="section-subtitle">
            My work brings together advocacy, training, community engagement, and strategic communications shaped by years of hands-on humanitarian experience.
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

      {/* ══ IMPACT STATISTICS ══ */}
      <section className="section stats-section" aria-labelledby="stats-heading">
        <div className="container">
          <h2 id="stats-heading" className="section-title">
            Measurable Change
          </h2>
          <p className="section-subtitle">
            A snapshot of the work I&apos;ve contributed to across communities, organizations, and programs.
          </p>

          <div style={{ marginTop: "3rem" }}>
            <StatsCounter stats={stats} />
          </div>
        </div>
      </section>

      {/* ══ PORTFOLIO ══ */}
      <section className="section" aria-labelledby="portfolio-heading">
        <div className="container">
          <h2 id="portfolio-heading" className="section-title">
            Portfolio
          </h2>
          <p className="section-subtitle">
            A visual journey through the activities, workshops, and community programs I&apos;ve been part of. Click any image to learn more.
          </p>

          <div style={{ marginTop: "3rem" }}>
            <PortfolioGrid
              items={portfolioItems}
              labels={{
                modalActivity: "Activity",
                modalRole: "My Role",
                modalImpact: "Impact & Outcomes",
                closeModal: "Close",
              }}
            />
          </div>

          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <Link href="/portfolio" className="btn btn-outline">
              View Full Portfolio
            </Link>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section
        className="section"
        style={{ background: "var(--color-cream-dark)" }}
        aria-labelledby="testimonials-heading"
      >
        <div className="container">
          <h2 id="testimonials-heading" className="section-title">
            Kind Words
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
      <section className="section blog-section" aria-labelledby="blog-heading">
        <div className="container">
          <div className="blog-section-header">
            <div>
              <h2 id="blog-heading" className="section-title">
                From the Blog
              </h2>
              <p className="section-subtitle">
                Reflections, research, and insights on humanitarian work, digital rights, gender issues, and community engagement.
              </p>
            </div>
            <Link href="/blog" className="btn btn-outline">
              View All Articles
            </Link>
          </div>

          {posts.length > 0 ? (
            <>
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
          <h2 id="cta-heading" className="cta-title">
            Let&apos;s Create Impact Together
          </h2>
          <p className="cta-desc">
            Whether you need a facilitator, trainer, or strategic partner for
            community programs, I&apos;d love to hear about your work and explore
            how we can collaborate.
          </p>
          <Link href="/contact" className="btn btn-white btn-lg">
            Get in Touch
          </Link>
        </section>
      </div>
    </>
  );
}
