#!/usr/bin/env node
/**
 * Replaces the body and SEO fields of the existing articles.
 *
 * Slugs are matched, never written — every URL stays exactly as it is, so no
 * existing link breaks. Only content, excerpt, meta fields, focus keyword,
 * tags and reading time are updated.
 *
 *   node scripts/seed-articles.mjs --local
 *   node scripts/seed-articles.mjs --remote
 */

export const ARTICLES = [
  {
    slug: "verifying-information-during-shutdowns",
    title: "How to verify information during an internet shutdown",
    metaTitle: "Verifying information during an internet shutdown",
    focusKeyword: "internet shutdown",
    metaDescription:
      "A practical method for verifying information during an internet shutdown, using offline sourcing, radio networks and physical confirmation.",
    excerpt:
      "When the network goes down, verification does not stop — it changes shape. This is the method community newsrooms fall back on when the usual tools are unreachable.",
    tags: ["digital rights", "verification", "internet shutdowns", "community media"],
    body: `
<p>Verifying information during an internet shutdown means falling back on methods that never depended on the network in the first place: named human sources, physical confirmation, radio cross-checks and a written log of what you know and how you know it. The tools change. The standard does not.</p>

<p>This matters because shutdowns do not stop information — they only stop <em>good</em> information. Rumour travels perfectly well by word of mouth. What disappears is the ability to check it quickly, which is precisely the capacity a newsroom needs most during the events that trigger shutdowns.</p>

<h2>What an internet shutdown actually breaks</h2>

<p>It helps to be specific, because the loss is uneven. Reverse image search, social media monitoring, messaging apps, cloud storage and remote collaboration all stop. So does the ability to reach a colleague in the next region to ask a simple question.</p>

<p>What survives is more than people expect. Shortwave and FM radio continue. SMS often continues, at least intermittently, because operators may throttle data while leaving voice and text running. Physical movement continues. Institutional relationships — with a clinic, a school, a district officer, a church or mosque — continue, and those are the relationships that carry verification when nothing else does.</p>

<p>Organisations that track these disruptions, including <a href="https://netblocks.org/" target="_blank" rel="noopener noreferrer">NetBlocks</a> and the <a href="https://www.accessnow.org/campaign/keepiton/" target="_blank" rel="noopener noreferrer">#KeepItOn coalition</a>, publish measurement data after the fact. That record is valuable for advocacy, but it arrives too late to help a newsroom working through the shutdown itself.</p>

<h2>Build the fallback before you need it</h2>

<p>The single most useful preparation is a contact tree written on paper. Not exported from a phone. Written down, duplicated, and held by more than one person.</p>

<p>A workable tree has three layers:</p>

<ul>
  <li><strong>Anchors</strong> — people who are physically fixed and institutionally visible. A clinic nurse, a head teacher, a market association secretary. They are reachable at a known place, and their information is tied to something observable.</li>
  <li><strong>Relays</strong> — people who travel routinely between areas. Drivers, traders, health outreach workers. They carry confirmation across distances that the network no longer covers.</li>
  <li><strong>Broadcasters</strong> — whoever can put a corrected fact in front of thousands of people at once. In most of the places this matters, that is a community radio station.</li>
</ul>

<p>Agree in advance what each layer is being asked for. Anchors confirm what they have personally seen. Relays carry messages and note what they observed en route. Broadcasters do not originate claims; they repeat only what has cleared the standard below.</p>

<h2>The verification standard that survives offline</h2>

<p>Strip verification back to its irreducible core and you get three questions, none of which require connectivity:</p>

<ol>
  <li><strong>Who saw this directly?</strong> Not who told you. Who was present. If nobody in the chain was present, you have a rumour with a long tail, not a report.</li>
  <li><strong>Can a second person, unconnected to the first, confirm the same detail?</strong> Independence is the whole point. Two people repeating the same market gossip is one source, not two.</li>
  <li><strong>What physical trace would exist if this were true — and is it there?</strong> A road closure leaves stopped vehicles. A clinic influx leaves a full waiting room. If the trace should exist and does not, the claim is weaker than it sounds.</li>
</ol>

<p>Write the answers down as you get them. During a shutdown you will be handling many partial claims at once, and memory is not a filing system. A simple ledger — claim, source, what they saw, time, status — is enough, and it becomes the record you publish from once connectivity returns.</p>

<h2>Working with radio when radio is what is left</h2>

<p>Community stations are the most under-used verification asset in a shutdown. They already have the audience, the reach and the trust. What they usually lack is a verification protocol they can apply under pressure.</p>

<p>Three practices make the difference. First, separate confirmed information from unconfirmed reports explicitly on air, in plain language, every time. Second, state what you do not know as clearly as what you do — an honest gap is more useful than a confident guess. Third, schedule correction slots rather than waiting for corrections to feel newsworthy; a fixed slot normalises the act of correcting.</p>

<p>If you are setting up these relationships from scratch, our <a href="/en/blog/community-radio-partnerships">field guide to community radio partnerships</a> covers the agreements worth making before a crisis rather than during one.</p>

<h2>What to do the moment connectivity returns</h2>

<p>The window immediately after restoration is the most valuable and the most wasted. Everyone rushes to catch up on the feed. The more useful move is to publish your ledger.</p>

<p>Post what you verified while offline, what you could not verify, and what turned out to be false. This does three things at once: it corrects the record while the audience is still paying attention, it demonstrates method rather than asserting authority, and it produces the documentation that advocacy organisations need. Groups such as <a href="https://cipesa.org/" target="_blank" rel="noopener noreferrer">CIPESA</a> and <a href="https://paradigmhq.org/" target="_blank" rel="noopener noreferrer">Paradigm Initiative</a> build cases from exactly this kind of contemporaneous, ground-level record.</p>

<p>That handover from newsroom to advocacy is where most of the value leaks away. We look at how to close it in <a href="/en/blog/digital-rights-after-shutdown">digital rights advocacy after the shutdown ends</a>.</p>

<h2>Common questions</h2>

<h3>Can you verify anything at all without the internet?</h3>
<p>Yes. Every verification standard in use today predates the internet. What connectivity changed is speed and reach, not the underlying logic of independent confirmation.</p>

<h3>Is a VPN a solution?</h3>
<p>Sometimes, and only partly. VPNs can route around some filtering, but they do nothing when data service is cut entirely, and in some jurisdictions their use carries legal risk. Treat them as one option in a plan, never as the plan.</p>

<h3>What is the most common verification failure during a shutdown?</h3>
<p>Circular sourcing. A claim moves through five people and comes back sounding like independent confirmation. Asking "who saw this directly" is the cheapest defence available.</p>

<p>If your organisation is building this capacity, <a href="/en/contact">get in touch</a> — this is the kind of protocol that works far better designed in advance than assembled under pressure.</p>
`,
  },

  {
    slug: "media-literacy-rural-classroom",
    title: "What media literacy actually looks like in a rural classroom",
    metaTitle: "Media literacy in rural schools: what actually works",
    focusKeyword: "media literacy",
    metaDescription:
      "Media literacy in rural schools works when it starts from the messages pupils already receive, not from imported curricula about platforms they do not use.",
    excerpt:
      "Most media literacy curricula are written for pupils with personal devices and steady connectivity. Here is what the subject looks like when neither is a given.",
    tags: ["media literacy", "education", "digital rights", "training"],
    body: `
<p>Media literacy in rural schools works when it begins with the messages pupils actually receive — forwarded voice notes, radio phone-ins, market rumour, family WhatsApp — rather than with an imported curriculum about platforms and settings menus they may never open.</p>

<p>That distinction sounds small. In practice it decides whether a programme changes anything. A lesson on adjusting privacy settings is meaningless to a class that shares two phones between forty pupils. A lesson on how a claim travels, and how to test it, applies whether the claim arrives by handset or by neighbour.</p>

<h2>Start from the actual information environment</h2>

<p>Before designing anything, spend a session finding out how information reaches the class. Ask directly. The answers are consistently more interesting than the assumptions.</p>

<p>In much of rural Africa the dominant channels are voice notes forwarded through family groups, community radio, and conversation — in roughly that order, and often mediated by whoever in the household owns the phone. <a href="https://www.gsma.com/mobileeconomy/" target="_blank" rel="noopener noreferrer">GSMA's mobile economy research</a> documents how uneven device ownership and data affordability remain across the continent, which is precisely why device-centred curricula land so badly.</p>

<p>Design for the shared handset, the borrowed handset, and the household radio. Those are the real conditions.</p>

<h2>Teach media literacy as mechanics, not as a list of platforms</h2>

<p>Platforms change. Interfaces change. The structure of a misleading claim does not. A curriculum built around durable mechanics stays useful for years; one built around a specific app is out of date before the term ends.</p>

<p>Four mechanics carry most of the weight:</p>

<ul>
  <li><strong>Provenance</strong> — where did this start, and how many hands has it passed through? Pupils can trace a forwarded voice note backwards through their own contacts and see the chain shorten to nothing.</li>
  <li><strong>Incentive</strong> — who benefits if this is believed? This is the single most transferable question in the whole subject, and it works on advertising, politics and playground rumour alike.</li>
  <li><strong>Evidence</strong> — what would have to be true for this claim to hold, and is any of it checkable locally?</li>
  <li><strong>Emotional pull</strong> — claims that travel fastest are the ones that make you feel something immediately. Recognising that reaction in yourself is a skill, and it can be practised.</li>
</ul>

<p>UNESCO's <a href="https://www.unesco.org/en/media-information-literacy" target="_blank" rel="noopener noreferrer">media and information literacy</a> framework is a reasonable scaffold, provided you adapt the examples entirely. Imported examples are the fastest way to lose a class.</p>

<h2>Use materials the school already has</h2>

<p>A media literacy lesson does not require a projector, a computer room or a connection. It requires examples.</p>

<p>Practical substitutes that work: a printed transcript of a real forwarded voice note, with the class working out what is checkable; a recorded radio segment played back and interrogated; a photocopied newspaper page compared against a second account of the same event; the teacher's own phone on a shared screen, if there is one.</p>

<p>The best single exercise costs nothing. Give the class a claim circulating locally that week. Ask them to establish, using only people they can physically reach, whether it holds. They come back with a real answer and, more importantly, a method they have now practised.</p>

<h2>Train teachers as practitioners, not as relays</h2>

<p>Programmes fail when teachers are handed a curriculum to deliver rather than a skill to hold. A teacher who has personally traced a false claim to its source teaches this subject differently from one working through a manual.</p>

<p>Budget for teacher sessions that are indistinguishable from pupil sessions: same exercises, same local examples, same requirement to come back with findings. It takes longer up front and it is the difference between a programme that outlives its funding and one that stops the month the workshops end.</p>

<h2>Measure something that means anything</h2>

<p>Attendance is not an outcome. Neither is a satisfaction score at the end of a workshop.</p>

<p>Better measures are behavioural and observable: can pupils, unprompted, name who benefits from a given claim? Do they ask where a piece of information came from before repeating it? Six months on, is the vocabulary still in use in the classroom? These are harder to collect and worth vastly more. We go into this properly in <a href="/en/blog/measuring-campaign-reach">measuring campaign reach honestly</a>.</p>

<p>The same verification instincts matter well beyond the classroom — see <a href="/en/blog/verifying-information-during-shutdowns">verifying information during internet shutdowns</a> for how these habits hold up when connectivity itself disappears.</p>

<h2>Common questions</h2>

<h3>At what age should media literacy start?</h3>
<p>The reasoning skills involved — provenance, incentive, evidence — are teachable from upper primary. The examples change with age; the mechanics do not.</p>

<h3>Does media literacy work without internet access?</h3>
<p>Yes, and arguably it matters more. Offline information environments still carry rumour, and pupils in them have fewer tools for checking it independently.</p>

<h3>How long should a programme run?</h3>
<p>Long enough for the vocabulary to become habitual. A single workshop produces recall; a term of short, repeated exercises produces behaviour.</p>

<p>If you are designing a programme and want it built around the conditions your schools actually operate in, <a href="/en/services">see how we approach this work</a>.</p>
`,
  },

  {
    slug: "reporting-gbv-without-retraumatising",
    title: "Reporting on gender-based violence without retraumatising survivors",
    metaTitle: "Trauma-informed reporting on gender-based violence",
    focusKeyword: "gender-based violence",
    metaDescription:
      "Practical standards for reporting on gender-based violence: consent as a process, interviews built around control, real anonymity and aftercare.",
    excerpt:
      "The story is not worth more than the person telling it. Practical standards for consent, control and aftercare when reporting on gender-based violence.",
    tags: ["gender-based violence", "ethics", "journalism", "humanitarian communications"],
    body: `
<p>Trauma-informed reporting on gender-based violence rests on a single principle: the survivor retains control over their own account, before, during and after publication. Everything else — how you approach, how you interview, what you publish, what you do afterwards — follows from that.</p>

<p>This is not a softer standard than conventional journalism. It is a stricter one. It requires more time, more preparation and a willingness to lose stories you cannot obtain safely.</p>

<h2>Consent is a process, not a signature</h2>

<p>A consent form obtained at the start of an interview tells you almost nothing about whether someone understands what publication will mean for them six months later.</p>

<p>Treat consent as something that is established, revisited and can be withdrawn. In practice:</p>

<ul>
  <li><strong>Explain distribution concretely.</strong> Not "this may be published online" but "this will be on a website anyone can search, including people in your community, and it will stay there."</li>
  <li><strong>Name the risks you can foresee</strong> — identification through detail, family reaction, employer reaction, legal exposure — and say plainly that you cannot foresee all of them.</li>
  <li><strong>Re-confirm before publication</strong>, once the piece exists and the person can see what they actually agreed to.</li>
  <li><strong>Honour withdrawal</strong>, including after publication where removal is technically possible. Agree in advance what you will do if asked.</li>
</ul>

<p>The <a href="https://dartcenter.org/" target="_blank" rel="noopener noreferrer">Dart Center for Journalism and Trauma</a> publishes detailed guidance on interviewing in these conditions and is the most useful single resource for reporters working this beat.</p>

<h2>Interviewing about gender-based violence: design around control</h2>

<p>Trauma responses are, in large part, responses to loss of control. An interview that removes control re-enacts the harm. An interview that returns it does not.</p>

<p>The practical adjustments are unglamorous and effective. Let the person choose the location and who else is present. Tell them at the outset that they can stop, skip a question, or end the conversation entirely with no consequence to their access to services. Ask permission before moving to a difficult area rather than sliding into it. Avoid asking for a chronological account of the incident itself unless it is genuinely necessary — narrative reconstruction under pressure is where most re-traumatisation happens.</p>

<p>Ask about aftermath rather than event where you can. What has changed since. What support existed or did not. What they want to happen now. This usually produces better journalism as well as safer interviews, because the aftermath is where the systemic failures live.</p>

<h2>Anonymity is a technical problem, not a promise</h2>

<p>Changing a name is not anonymisation. Communities identify people through detail: the location of a workplace, the number and ages of children, a distinctive job, the timing of an event, a photograph of hands or a doorway.</p>

<p>Work backwards. Assume a reader who lives in the same neighbourhood. Ask what combination of published details would let that reader identify the person, then remove enough of them that the answer is none. This will sometimes cost you specificity that would have made the piece stronger. Pay it.</p>

<p>Be equally careful with images and audio. Voice is identifying. So are room interiors, uniforms and visible landmarks.</p>

<h2>Know what you are referring people to</h2>

<p>Do not conduct an interview about violence without knowing, specifically, what support exists locally and whether it functions. A referral to a service that has no staff, charges fees, or requires travel the person cannot afford is not a referral.</p>

<p>Verify before you need it: what exists, what it costs, what hours it operates, whether it is safe for this particular person to be seen entering. <a href="https://www.unwomen.org/" target="_blank" rel="noopener noreferrer">UN Women</a> and the <a href="https://www.who.int/health-topics/violence-against-women" target="_blank" rel="noopener noreferrer">World Health Organization</a> both publish frameworks for what adequate response services look like, which is useful for judging whether what exists locally is adequate.</p>

<h2>Aftercare, including your own</h2>

<p>Two things get skipped almost universally: following up with the person after publication, and attending to the interviewer.</p>

<p>Follow-up need not be elaborate. A message a week after publication, asking whether anything has changed and whether they need anything, closes a loop that would otherwise leave someone exposed and alone with the consequences of a decision you asked them to make.</p>

<p>For the reporter or communications officer: repeated exposure to accounts of violence has a cumulative effect that is well documented and routinely ignored in small organisations. Build in supervision, rotate the beat where possible, and treat this as an operational requirement rather than a personal weakness.</p>

<h2>Common questions</h2>

<h3>Should survivors ever be named?</h3>
<p>Only where the person has asked to be named, understands the specific risks, and there is no coercion — including the subtle coercion of being told their story will have more impact. Default to protection.</p>

<h3>Is it ethical to pay for interviews?</h3>
<p>Payment for testimony creates an incentive to disclose, which compromises consent. Reimbursing genuine costs — transport, childcare, lost earnings — is a different matter and is usually appropriate.</p>

<h3>What if the story is in the public interest and the survivor declines?</h3>
<p>Then you do not have that story. Public interest justifies intrusion on the powerful, not on the person who was harmed.</p>

<p>The same tension between narrative impact and the dignity of the subject runs through <a href="/en/blog/humanitarian-storytelling-failing">why humanitarian storytelling keeps failing its subjects</a>, and the protocols overlap considerably with <a href="/en/blog/crisis-communications-plan">building a crisis communications plan that survives contact</a>.</p>
`,
  },

  {
    slug: "platform-moderation-african-languages",
    title: "The quiet cost of platform moderation in African languages",
    metaTitle: "Content moderation in African languages: the coverage gap",
    focusKeyword: "content moderation",
    metaDescription:
      "Content moderation in African languages is thinly resourced. Users pay for it twice: legitimate speech removed, and real harm left standing.",
    excerpt:
      "Moderation systems are built and measured in a handful of languages. Everywhere else, users absorb the cost of a system that cannot read them.",
    tags: ["digital rights", "content moderation", "platform accountability", "language"],
    body: `
<p>Content moderation in African languages is thinly resourced relative to the number of people who speak them, and the cost of that gap falls on users in two directions at once: legitimate speech is removed because a system misreads it, and genuinely harmful content stays up because no system is reading it at all.</p>

<p>Both failures are invisible in the metrics platforms publish, which is part of why the gap persists.</p>

<h2>Why the content moderation gap exists</h2>

<p>Automated moderation depends on training data. Training data depends on large volumes of labelled text, which depends in turn on commercial incentive and academic attention. Languages that carry a great deal of human conversation but comparatively little advertising revenue attract neither.</p>

<p>The result is structural rather than malicious. A classifier trained overwhelmingly on English performs badly on Wolof, Tigrinya, Fulfulde or Cameroonian Pidgin — and worse still on the code-switching that is normal in actual speech, where a single sentence may move between three languages. Human review, the fallback when automation fails, requires reviewers who speak the language, understand the local political context, and are available in the relevant time zone. That is expensive and it is where budgets get cut first.</p>

<p>Platforms publish some of this in their transparency reporting — <a href="https://transparency.meta.com/" target="_blank" rel="noopener noreferrer">Meta's transparency centre</a> is the most detailed — but language-level breakdowns of enforcement accuracy generally are not included, which makes independent assessment difficult by design.</p>

<h2>The two failures, and who absorbs them</h2>

<p><strong>Over-removal</strong> hits ordinary speech. Political criticism, reporting on violence, reclaimed slurs, satire and religious language are all routinely misread when the reviewer or the model lacks context. For a journalist or an activist, an account suspension in the middle of a crisis is not an inconvenience; it is the loss of their distribution at the moment it matters most.</p>

<p><strong>Under-removal</strong> hits targets of coordinated harm. Incitement, organised harassment and dehumanising language in a language nobody is monitoring simply remains. Where that language is tied to ethnic or political conflict, the consequences are not confined to the platform.</p>

<p>These failures are not symmetrical in who they affect, and neither shows up in a headline enforcement figure.</p>

<h2>What actually moves the needle</h2>

<p>Complaint volume alone does not. Documentation does. The organisations that have won changes have done so by producing evidence of a specific, repeated, categorisable failure.</p>

<p>The components of a usable case:</p>

<ul>
  <li><strong>A defined language and dialect</strong>, named precisely rather than as "local language".</li>
  <li><strong>Multiple instances</strong> of the same failure type, captured with screenshots, timestamps, account context and the enforcement notice received.</li>
  <li><strong>The correct reading</strong> — what the content actually meant, explained by someone who speaks it, so the error is legible to a reviewer who does not.</li>
  <li><strong>Demonstrated pattern</strong>, showing this is systemic rather than a single bad call.</li>
</ul>

<p>Cases built this way have a route. The <a href="https://www.oversightboard.com/" target="_blank" rel="noopener noreferrer">Oversight Board</a> takes appeals on Meta's decisions and publishes reasoned determinations. <a href="https://www.article19.org/" target="_blank" rel="noopener noreferrer">ARTICLE 19</a> and <a href="https://cipesa.org/" target="_blank" rel="noopener noreferrer">CIPESA</a> pursue policy engagement, and <a href="https://globalvoices.org/" target="_blank" rel="noopener noreferrer">Global Voices</a> has documented language-specific moderation failures across multiple regions.</p>

<h2>What organisations should do in the meantime</h2>

<p>Assume your distribution can vanish without warning, and plan accordingly.</p>

<p>Keep an owned channel — a mailing list, a website, an SMS list — that no platform decision can switch off. Archive your own content, because you cannot appeal what you cannot produce. Document every enforcement action against you at the time it happens, with the notice text, rather than reconstructing it later. Where your audience is reachable by radio, treat that as infrastructure rather than a legacy channel; our <a href="/en/blog/community-radio-partnerships">guide to community radio partnerships</a> covers how those relationships are built.</p>

<h2>The measurement problem underneath</h2>

<p>The deeper issue is that moderation quality is measured in aggregate while it is experienced locally. A system that is 99% accurate globally can be close to useless in a language representing a fraction of a per cent of the corpus, and the global figure will never show it.</p>

<p>Until enforcement accuracy is reported by language, external assessment depends on exactly the kind of ground-level documentation described above. That work is slow, unglamorous and currently the only thing that produces evidence at all.</p>

<h2>Common questions</h2>

<h3>Why not just hire more moderators?</h3>
<p>It is necessary but not sufficient. Reviewers need language, local political context and workable conditions — and reviewing violent content at volume carries a documented psychological cost that thin contracting arrangements rarely account for.</p>

<h3>Does AI translation solve this?</h3>
<p>Not reliably. Machine translation degrades on low-resource languages and on code-switching, which is precisely where moderation decisions are hardest. It can assist triage; it cannot substitute for comprehension.</p>

<h3>What can an individual user do?</h3>
<p>Appeal every wrongful action, and keep the record. Individual appeals rarely succeed alone, but they are the raw material from which a documented pattern is built.</p>

<p>This connects directly to shutdown advocacy, where the same documentation discipline applies — see <a href="/en/blog/digital-rights-after-shutdown">digital rights advocacy after the shutdown ends</a>.</p>
`,
  },

  {
    slug: "crisis-communications-plan",
    title: "Building a crisis communications plan that survives contact",
    metaTitle: "How to build a crisis communications plan that works",
    focusKeyword: "crisis communications plan",
    metaDescription:
      "A crisis communications plan works only if it survives contact. Build it around decision rights, pre-cleared language and channels you own.",
    excerpt:
      "Most crisis plans fail in the first hour — not because they are wrong, but because nobody can find them, and nobody knows who decides.",
    tags: ["crisis communications", "strategy", "risk", "organisational"],
    body: `
<p>A crisis communications plan survives contact when it answers three questions before the crisis arrives: who decides, what can be said without further approval, and through which channels. Plans that fail almost always fail on the first question.</p>

<p>The document itself matters far less than the decisions encoded in it. A one-page plan people have rehearsed beats a forty-page plan nobody has opened.</p>

<h2>Decision rights, written down and named</h2>

<p>In the first hour of a crisis the binding constraint is authority, not information. Someone must be able to say something publicly without convening a committee.</p>

<p>Write this down explicitly:</p>

<ul>
  <li><strong>Who is the single spokesperson</strong>, and who takes that role if they are unreachable, travelling, or personally involved in the incident?</li>
  <li><strong>What can that person say without additional sign-off?</strong> This is the most important line in the entire plan.</li>
  <li><strong>What requires escalation</strong>, to whom, and within what time?</li>
  <li><strong>Who is explicitly not authorised to speak</strong> — stated kindly but unambiguously, because well-meaning staff filling a silence is a common failure mode.</li>
</ul>

<p>Name individuals, not job titles alone. Titles are ambiguous under pressure; names are not.</p>

<h2>Pre-clear the language you will certainly need</h2>

<p>You cannot draft the statement for an unknown event. You can draft the sentences every crisis requires, and clear them in advance with whoever would otherwise slow you down.</p>

<p>The reliably reusable pieces are: an acknowledgement that something has happened and you are establishing the facts; a holding line for when you genuinely do not yet know; a statement of concern for anyone affected that does not admit or deny liability; and a commitment to update at a stated time. That last one is underrated — a promise to say more at four o'clock buys hours of goodwill and costs nothing.</p>

<p>Get legal or board approval for these while nobody is panicking. That approval is the thing you will not be able to obtain quickly when you need it.</p>

<h2>Own at least one channel outright</h2>

<p>A plan that depends entirely on social platforms depends on systems you do not control and cannot appeal quickly. Accounts get restricted, reach collapses, and in some contexts the network itself is switched off.</p>

<p>Maintain something you own: a website page you can update, a mailing list, an SMS list, a relationship with a radio station. Test that you can actually publish to it — many organisations discover during a crisis that the only person with the website password has left.</p>

<p>Where connectivity itself is at risk, the fallbacks in <a href="/en/blog/verifying-information-during-shutdowns">verifying information during internet shutdowns</a> apply to outbound communication as much as to verification.</p>

<h2>Rehearse the plan, not the scenario</h2>

<p>Elaborate scenario exercises are enjoyable and mostly test imagination. What needs testing is the machinery.</p>

<p>A short, useful drill: at an unannounced moment, send a message to the team saying an incident has occurred. Then measure how long it takes for the right person to be reached, for a holding statement to be approved, and for it to appear on a channel you control. Whatever that number is, it is your real response time. Most organisations are shocked by it the first time.</p>

<p>Run it twice a year. It takes an hour and it finds the broken links — the wrong phone number, the dormant account, the approver on leave — while they are cheap to fix.</p>

<h2>Say what is true, including that you do not know</h2>

<p>The instinct to withhold until you have the full picture is understandable and usually counterproductive. Silence is read as concealment, and the gap fills with other people's accounts.</p>

<p>Saying "here is what we know, here is what we do not, here is when we will next update" is almost always stronger than saying nothing. It is also the only position you cannot later be caught out on.</p>

<p>Where the crisis involves harm to individuals, the standards in <a href="/en/blog/reporting-gbv-without-retraumatising">trauma-informed reporting on gender-based violence</a> apply to your own communications too: no identifying detail without informed consent, and no use of a person's experience to demonstrate your responsiveness.</p>

<h2>After: measure the response, not the coverage</h2>

<p>Post-crisis reviews tend to count mentions and sentiment. More useful questions: did the people directly affected receive accurate information, and when? Was our first statement accurate in hindsight? Where did the delay actually occur?</p>

<p>That last question is the one that improves the next response. We look at honest measurement in <a href="/en/blog/measuring-campaign-reach">measuring campaign reach honestly</a>.</p>

<h2>Common questions</h2>

<h3>How long should a crisis communications plan be?</h3>
<p>Short enough to be read in full during an emergency. One page of decisions plus an annex of contacts and pre-cleared language is a workable shape.</p>

<h3>Who should hold the plan?</h3>
<p>Everyone named in it, in a form reachable without the office network — including on paper. A plan stored only on a system that may itself be affected is not a plan.</p>

<h3>How often should it be reviewed?</h3>
<p>Whenever a named person changes role, and at minimum twice a year. Staff turnover, not strategy drift, is what usually invalidates these documents.</p>

<p>If you would like this built and rehearsed with your team rather than written and filed, <a href="/en/contact">let us talk</a>.</p>
`,
  },

  {
    slug: "humanitarian-storytelling-failing",
    title: "Why humanitarian storytelling keeps failing its subjects",
    metaTitle: "Ethical humanitarian storytelling: fixing what fails",
    focusKeyword: "humanitarian storytelling",
    metaDescription:
      "Humanitarian storytelling fails when incentives reward suffering over agency. What changes when subjects hold consent, context and control.",
    excerpt:
      "The problem is not bad intentions. It is an incentive structure that pays for suffering and does not pay for context.",
    tags: ["humanitarian communications", "ethics", "storytelling", "advocacy"],
    body: `
<p>Humanitarian storytelling keeps failing its subjects because the incentives reward the wrong thing. Funding appeals perform better with visible distress than with context, so the sector produces distress at scale — and the people depicted absorb a cost that never appears on the campaign report.</p>

<p>This is not a problem of intent. Almost everyone involved is trying to help. It is a problem of what gets measured and what gets paid for.</p>

<h2>Where humanitarian storytelling fails, precisely</h2>

<p><strong>Compression.</strong> A person's life is reduced to the worst week of it. Everything that makes them a full participant in their own circumstances — work, opinions, competence, humour — is cut, because it complicates the appeal. What remains is legible as need and illegible as personhood.</p>

<p><strong>Displacement of agency.</strong> The story is structured so that change arrives from outside. The subject waits; the donor acts. This is usually false as a description of events — local response almost always precedes international response — and it teaches audiences a model of the world that makes good policy harder to argue for later.</p>

<p><strong>Permanence.</strong> A photograph taken during someone's worst month remains searchable for the rest of their life, attached to their name, in front of employers, neighbours and their own children. Consent obtained in a camp in 2019 did not contemplate that.</p>

<h2>What informed consent has to cover</h2>

<p>Consent in this context is meaningful only if the person understands distribution, duration and reversibility — and is genuinely free to refuse.</p>

<p>That last condition is the one most often broken. When the person asking for the story is connected, even indirectly, to the organisation providing food or shelter, refusal carries perceived risk. Say explicitly and early that declining changes nothing about their access to services, and mean it structurally: whoever collects the story should not be the person who allocates the aid.</p>

<p>The <a href="https://corehumanitarianstandard.org/" target="_blank" rel="noopener noreferrer">Core Humanitarian Standard</a> sets out commitments on dignity and participation that most agencies have signed, and the <a href="https://www.cdacnetwork.org/" target="_blank" rel="noopener noreferrer">CDAC Network</a> works specifically on communication as a form of accountability to affected people rather than as a fundraising input. Both are more useful than internal comms guidelines.</p>

<h2>Practical changes that cost little</h2>

<ul>
  <li><strong>Lead with what people are doing</strong>, not what has been done to them. This is almost always more accurate and it does not measurably harm fundraising.</li>
  <li><strong>Name people properly</strong> where it is safe, with full name and their own description of what they do. "Mother of three" is not an occupation.</li>
  <li><strong>Set an expiry on consent.</strong> Two years is a reasonable default. Re-confirm or retire the material.</li>
  <li><strong>Give people the file.</strong> A copy of the photograph or recording, in a form they can keep. Costs nothing, changes the relationship entirely.</li>
  <li><strong>Publish the context</strong> — what caused this, what policy sustains it — even when it complicates the appeal. Especially then.</li>
</ul>

<h2>The measurement change that matters most</h2>

<p>If the only number reported is funds raised per campaign, the system will keep optimising towards distress. Adding a second number changes the incentive.</p>

<p>Useful candidates: proportion of published material in which the subject is described by what they do; proportion of subjects who received a copy; number of consent expiries honoured. None of these are hard to collect. All of them make the trade-off visible to the people approving budgets, which is where the decision actually sits.</p>

<p>We deal with the wider measurement question in <a href="/en/blog/measuring-campaign-reach">measuring campaign reach honestly</a>.</p>

<h2>Where this overlaps with reporting on violence</h2>

<p>The protections are largely the same, and the failure modes rhyme: identification through incidental detail, consent obtained under implicit pressure, and no follow-up after publication. The standards in <a href="/en/blog/reporting-gbv-without-retraumatising">trauma-informed reporting on gender-based violence</a> transfer directly to humanitarian communications and should be treated as the floor.</p>

<h2>Common questions</h2>

<h3>Does ethical storytelling raise less money?</h3>
<p>The evidence is more mixed than sector folklore suggests, and much of the comparison is confounded by spend and placement. The stronger argument is that an organisation's stated values should constrain its fundraising methods regardless.</p>

<h3>Can you use archive images of identifiable people?</h3>
<p>Only if the original consent covered the current use and has not expired. In practice most archives cannot demonstrate this, which is an argument for consent expiry dates from the outset.</p>

<h3>Who should hold the camera?</h3>
<p>Wherever possible, someone from the community being depicted. It changes framing, access and the power dynamic in the room, and it keeps the skill and the fee local.</p>

<p>If you are rewriting your organisation's storytelling standards, <a href="/en/services">this is work we do</a>.</p>
`,
  },

  {
    slug: "digital-rights-after-shutdown",
    title: "Digital rights advocacy after the shutdown ends",
    metaTitle: "Digital rights advocacy after an internet shutdown",
    focusKeyword: "digital rights advocacy",
    metaDescription:
      "Digital rights advocacy after a shutdown depends on evidence gathered while it happened. How to document, cost and escalate a disruption.",
    excerpt:
      "Attention collapses the moment connectivity returns. The advocacy that works is built from evidence collected while the lights were still off.",
    tags: ["digital rights", "internet shutdowns", "advocacy", "policy"],
    body: `
<p>Digital rights advocacy after an internet shutdown succeeds or fails on evidence collected during the shutdown itself. Once connectivity returns, attention collapses within days, and an organisation that starts gathering documentation at that point has already missed its window.</p>

<p>The uncomfortable implication is that the advocacy work begins while the network is still down, when it is hardest to do.</p>

<h2>What counts as evidence in digital rights advocacy</h2>

<p>Technical measurement establishes that a disruption occurred. It does not establish what it cost. Both are needed, and organisations consistently over-invest in the first.</p>

<p><strong>Technical record.</strong> Independent measurement from <a href="https://netblocks.org/" target="_blank" rel="noopener noreferrer">NetBlocks</a> or similar, plus your own timestamped notes on what was unreachable and from which networks. Note the granularity — full blackout, mobile data only, specific platforms — because remedies differ.</p>

<p><strong>Legal record.</strong> Any directive, licence condition or public statement authorising the restriction, and the statutory basis claimed. Where no instrument exists, that absence is itself the finding.</p>

<p><strong>Human record.</strong> This is the part that persuades and the part that is almost always missing. Specific, attributable accounts of what could not be done: the clinic that could not confirm a referral, the trader who lost perishable stock, the student who missed an examination registration, the family who could not receive a transfer.</p>

<p>Collect the human record contemporaneously. Reconstructed six weeks later it is vague, and vagueness is what allows a disruption to be characterised as a minor inconvenience.</p>

<h2>Cost it in terms decision-makers already use</h2>

<p>Rights arguments alone rarely move a finance ministry. Economic arguments frequently do, and the two are not in tension.</p>

<p>You do not need a sophisticated model. Document what closed, for how long, and what those operations turn over on a normal day. Mobile money agents, transport operators, market traders and small businesses that depend on digital payments are the clearest cases, and their operators can usually tell you precisely. <a href="https://www.itu.int/" target="_blank" rel="noopener noreferrer">ITU</a> connectivity data and <a href="https://www.gsma.com/mobileeconomy/" target="_blank" rel="noopener noreferrer">GSMA's mobile economy reporting</a> give you the national context to place those figures in.</p>

<p>An estimate presented with its method and its uncertainty stated is far stronger than a confident number nobody can check.</p>

<h2>Escalation routes that exist</h2>

<p>Documentation without a destination is an archive, not advocacy. Decide the route before you collect.</p>

<ul>
  <li><strong>Coalition submission.</strong> The <a href="https://www.accessnow.org/campaign/keepiton/" target="_blank" rel="noopener noreferrer">#KeepItOn coalition</a> aggregates national evidence into international pressure and has an established process.</li>
  <li><strong>Regional mechanisms.</strong> Continental and sub-regional human rights bodies accept communications, and regional courts have issued relevant judgments on network disruptions.</li>
  <li><strong>Domestic litigation.</strong> Slow, expensive, and the only route that produces binding precedent. Requires exactly the contemporaneous record described above.</li>
  <li><strong>Operator engagement.</strong> Telecommunications companies executing an order are a pressure point, particularly those with international parent companies subject to human rights reporting obligations.</li>
</ul>

<p><a href="https://paradigmhq.org/" target="_blank" rel="noopener noreferrer">Paradigm Initiative</a> and <a href="https://cipesa.org/" target="_blank" rel="noopener noreferrer">CIPESA</a> both run established programmes on this across the continent, and coordinating with an organisation that already has standing saves considerable time.</p>

<h2>Publish before the attention goes</h2>

<p>The first seventy-two hours after restoration are worth more than the following three months. People are online, the experience is recent, and the emotional memory is intact.</p>

<p>Have the summary drafted before the network returns. Publish the human record first and the technical analysis second — the technical piece is for the eventual submission, the human piece is what makes anyone care enough to read it. Newsrooms that kept a verification ledger through the disruption, as described in <a href="/en/blog/verifying-information-during-shutdowns">verifying information during internet shutdowns</a>, already have most of this written.</p>

<h2>Connect it to the wider pattern</h2>

<p>A single shutdown is an incident. A documented sequence is a pattern, and patterns are what change policy. Keep a running national record with consistent fields — dates, scope, stated justification, legal basis, measured duration, documented costs — so each new event strengthens the case rather than restarting it.</p>

<p>The same discipline applies to platform-level restrictions on speech, which often accompany network disruptions; see <a href="/en/blog/platform-moderation-african-languages">the quiet cost of platform moderation in African languages</a>.</p>

<h2>Common questions</h2>

<h3>Is it worth documenting a short shutdown?</h3>
<p>Yes. Short disruptions are how longer ones become normalised, and they are the cheapest entries to add to a pattern record.</p>

<h3>What if the shutdown was officially denied?</h3>
<p>Independent measurement data becomes the centre of the case rather than a supporting exhibit, and the denial itself becomes part of the record.</p>

<h3>Who should hold the documentation?</h3>
<p>More than one organisation, in more than one jurisdiction. Records held only where the disruption occurred are vulnerable to the same pressures that produced it.</p>
`,
  },

  {
    slug: "notes-from-drif25",
    title: "The Digital Rights and Inclusion Forum: what it is and why it matters",
    metaTitle: "Digital Rights and Inclusion Forum: a working primer",
    focusKeyword: "Digital Rights and Inclusion Forum",
    metaDescription:
      "A primer on the Digital Rights and Inclusion Forum — what the convening covers, which debates recur, and how to get value from attending or following it.",
    excerpt:
      "A primer on Africa's main digital rights convening: what it covers, which arguments recur, and how to get something durable out of attending.",
    tags: ["digital rights", "events", "policy", "advocacy"],
    body: `
<p>The Digital Rights and Inclusion Forum, convened by <a href="https://paradigmhq.org/" target="_blank" rel="noopener noreferrer">Paradigm Initiative</a>, is the main annual gathering for digital rights work across Africa. It brings together civil society organisations, regulators, technologists, journalists and funders around questions of access, expression and online safety on the continent.</p>

<p>This piece is a primer on what the forum covers and how to get durable value from it, rather than a report from any particular edition.</p>

<h2>The debates that recur</h2>

<p>Four arguments come back year after year, because none of them are settled.</p>

<p><strong>Access versus affordability.</strong> Coverage maps continue to improve while the cost of a usable data bundle remains out of reach for a large share of the population. Being technically covered and being meaningfully connected are different conditions, and policy tends to measure the first.</p>

<p><strong>Network disruptions and their legal basis.</strong> Shutdowns and platform blocking recur around elections, examinations and protests. The persistent question is procedural: what instrument authorised it, what oversight applied, and what remedy exists. Documentation practice on this is covered in <a href="/en/blog/digital-rights-after-shutdown">digital rights advocacy after the shutdown ends</a>.</p>

<p><strong>Data protection in practice.</strong> Many African states now have data protection legislation. Considerably fewer have adequately resourced regulators, which turns a legal right into an administrative question about capacity.</p>

<p><strong>Language and platform accountability.</strong> Moderation systems built and evaluated in a handful of languages produce predictable failures everywhere else — a structural issue we examine in <a href="/en/blog/platform-moderation-african-languages">the quiet cost of platform moderation in African languages</a>.</p>

<h2>Who is in the room, and why it matters</h2>

<p>The forum's distinguishing feature is that regulators and civil society are present at the same time. That is rarer than it sounds, and it changes what is possible: a conversation with a regulator who has heard the evidence directly is a different conversation from one mediated by a submission.</p>

<p>The practical implication for attendees is that the corridor conversations carry more weight than the panels. Plan for them deliberately.</p>

<h2>How to get something durable out of attending</h2>

<ul>
  <li><strong>Arrive with a specific ask.</strong> Not "we work on digital rights" but a named problem, the evidence you hold, and what you need from a particular kind of counterpart.</li>
  <li><strong>Bring documentation, not slides.</strong> A two-page case with dates, instruments and costs is portable and gets forwarded. A deck does not.</li>
  <li><strong>Identify the two people you need</strong> before you go, and treat everything else as a bonus.</li>
  <li><strong>Write your notes the same evening.</strong> Convening memory decays fast, and the commitment someone made in a corridor is worth exactly as much as your record of it.</li>
  <li><strong>Follow up within the week</strong>, while the meeting is still a shared reference point.</li>
</ul>

<h2>If you cannot attend</h2>

<p>Most of the substance is available afterwards without travel. Session recordings and reports are generally published by the organisers, and the wider research base is open: <a href="https://cipesa.org/" target="_blank" rel="noopener noreferrer">CIPESA</a> publishes continent-wide analysis on internet freedom, <a href="https://www.article19.org/" target="_blank" rel="noopener noreferrer">ARTICLE 19</a> covers expression and legal frameworks, and <a href="https://globalvoices.org/" target="_blank" rel="noopener noreferrer">Global Voices</a> carries ground-level reporting from contributors in the region.</p>

<p>Following the published outputs and engaging with the organisations directly captures most of the value for organisations without travel budgets.</p>

<h2>Common questions</h2>

<h3>Who should attend?</h3>
<p>Organisations with a live case they need to move, rather than those seeking a general introduction to the field. The forum rewards specificity.</p>

<h3>Is it useful for journalists?</h3>
<p>Yes — particularly for building regulator and civil society contacts that are difficult to establish cold, and for understanding the legal framing behind disruptions you may have to cover at short notice.</p>

<h3>What should an organisation prepare beforehand?</h3>
<p>One documented case, in writing, that a stranger could act on. That single artefact does more than any amount of general positioning.</p>
`,
  },

  {
    slug: "community-radio-partnerships",
    title: "A field guide to community radio partnerships",
    metaTitle: "Community radio partnerships: a practical field guide",
    focusKeyword: "community radio",
    metaDescription:
      "Community radio partnerships work when the station is treated as an editorial partner rather than a distribution channel. Practical terms, formats and pitfalls.",
    excerpt:
      "Radio remains the widest-reaching medium in much of Africa. Most partnerships still treat it as a noticeboard — and get noticeboard results.",
    tags: ["community radio", "partnerships", "communications", "rural"],
    body: `
<p>Community radio partnerships work when the station is treated as an editorial partner with its own judgement and its own audience relationship — not as a distribution channel that happens to be cheap. Organisations that get this wrong buy airtime and wonder why nothing changed.</p>

<p>Radio remains the widest-reaching medium across much of rural Africa, for reasons that have not shifted: it works on a shared handset or a cheap receiver, it needs no data bundle, it operates in the language people actually speak, and it functions when the network does not.</p>

<h2>Understand what community radio actually is</h2>

<p>Community stations are not small commercial broadcasters. They are typically volunteer-heavy, chronically under-funded, licensed under conditions that restrict advertising, and accountable to a local management committee that will outlast your project.</p>

<p>Three consequences follow. Their credibility with the audience is their entire asset, and they will protect it — correctly — against content that threatens it. Their capacity is genuinely limited, so a partnership that adds work without adding resource will quietly stall. And they are permanent in a way your project is not, which should shape what you ask for.</p>

<p><a href="https://www.mediasupport.org/" target="_blank" rel="noopener noreferrer">International Media Support</a> and <a href="https://internews.org/" target="_blank" rel="noopener noreferrer">Internews</a> both work extensively on local media sustainability, and their material is a useful corrective to the assumption that access is the hard part.</p>

<h2>Agree the terms that actually cause disputes</h2>

<p>Write these down before anything is broadcast. Every one of them has ended a partnership somewhere.</p>

<ul>
  <li><strong>Editorial control.</strong> Who decides final content? The honest answer is usually the station, and pretending otherwise creates a conflict later.</li>
  <li><strong>Corrections.</strong> What happens when something broadcast turns out to be wrong — who issues it, in which slot, how quickly?</li>
  <li><strong>Attribution.</strong> How is your organisation named on air? Excessive branding erodes the trust you are borrowing.</li>
  <li><strong>Payment.</strong> For airtime, for production, and for people's time. Volunteer labour is still labour.</li>
  <li><strong>What happens at the end.</strong> Does the station keep the equipment, the training and the formats? It should.</li>
</ul>

<h2>Formats that work better than sponsored spots</h2>

<p>A paid announcement is the least effective use of the medium, and the most commonly purchased.</p>

<p><strong>Phone-in with a competent guest.</strong> The questions callers ask tell you what your written materials failed to explain, which makes this a research method as well as a broadcast.</p>

<p><strong>Recurring short segment.</strong> Three minutes in an existing popular programme, every week, in the same slot. Repetition inside a trusted programme beats a longer one-off almost every time.</p>

<p><strong>Drama.</strong> Labour-intensive and disproportionately effective for behaviour-related topics, because it carries context and consequence rather than instruction.</p>

<p><strong>Correction slot.</strong> A fixed weekly segment addressing rumours circulating locally. This builds the station's authority and yours simultaneously, and it is the format most under-used. The verification standards in <a href="/en/blog/verifying-information-during-shutdowns">verifying information during internet shutdowns</a> apply directly.</p>

<h2>Invest in the station, not just the campaign</h2>

<p>The partnerships that produce results over years look less like media buying and more like capacity building: training presenters in interview technique and verification, contributing to equipment that outlives the project, and paying properly for production time.</p>

<p>This is also the difference between a station that reads your script and a station that argues with you about it — and the second is worth considerably more, because it means someone with local judgement is checking your assumptions before they reach the audience.</p>

<p>Where the station serves schools, the classroom work in <a href="/en/blog/media-literacy-rural-classroom">what media literacy actually looks like in a rural classroom</a> pairs naturally with a radio segment; pupils who have practised interrogating claims make unusually good phone-in participants.</p>

<h2>Measure what radio is actually good at</h2>

<p>Reach estimates for community radio are soft, and precision claims should be treated with suspicion. What can be observed is more useful anyway: call volume and the substance of what callers ask, whether a specific phrase from the programme starts appearing in community conversation, and whether service uptake changes in the broadcast area against a comparable area.</p>

<p>Honest measurement of soft-reach channels is dealt with in <a href="/en/blog/measuring-campaign-reach">measuring campaign reach honestly</a>.</p>

<h2>Common questions</h2>

<h3>How much should we pay for airtime?</h3>
<p>Ask the station for its rate card and pay it. Negotiating community radio down is a poor economy — the station is usually operating close to the line, and goodwill is the asset you are buying.</p>

<h3>Should we script segments ourselves?</h3>
<p>Provide the substance and let presenters put it in their own words. Scripted delivery is audible, and audiences discount it.</p>

<h3>What is the most common mistake?</h3>
<p>Arriving with a campaign that ends in three months and asking for a relationship that would take a year to build. Start smaller and stay longer.</p>

<p>If you are setting up this kind of partnership, <a href="/en/contact">we can help you structure it</a>.</p>
`,
  },

  {
    slug: "measuring-campaign-reach",
    title: "Measuring campaign reach honestly",
    metaTitle: "How to measure campaign reach honestly",
    focusKeyword: "campaign reach",
    metaDescription:
      "Measuring campaign reach honestly means reporting what you can defend. How to separate reach from attention, attention from change, and avoid vanity metrics.",
    excerpt:
      "Reach numbers are the easiest thing to inflate and the least useful thing to know. What to measure instead, and how to report it without overclaiming.",
    tags: ["measurement", "evaluation", "strategy", "campaigns"],
    body: `
<p>Measuring campaign reach honestly means separating three things that reports routinely blend: how many people had the opportunity to see something, how many actually attended to it, and how many did anything differently afterwards. Most reporting collapses all three into one number, and that number is almost always the least defensible of the three.</p>

<h2>What campaign reach figures actually mean</h2>

<p>"Reach" in platform analytics means an opportunity to see. It does not mean seen, read, understood or believed. A post that appeared in 40,000 feeds and was scrolled past in 40,000 feeds reports identically to one that was read.</p>

<p>Radio reach is an estimate derived from coverage area and survey data, usually old survey data. Print circulation counts copies distributed, not copies opened. Event attendance counts bodies in a room, some of whom are colleagues.</p>

<p>None of this makes the numbers useless. It makes them a measure of <em>distribution</em>, which is worth knowing and should be labelled as such.</p>

<h2>The three-tier structure worth adopting</h2>

<p>Report in tiers, and never let a number from one tier be presented as evidence of another.</p>

<ol>
  <li><strong>Distribution</strong> — what you sent out and where it could have been seen. Fully within your control, easy to verify, weak evidence of anything.</li>
  <li><strong>Engagement</strong> — what people did that required effort. Time on page rather than page views. Calls to a phone-in. Questions asked at a session. Materials requested. Each of these costs the audience something, which is what makes them meaningful.</li>
  <li><strong>Change</strong> — what is different now. Service uptake, policy movement, reported behaviour, recall in a follow-up survey. Slow, expensive, and the only tier that answers the question anyone actually asked.</li>
</ol>

<p><a href="https://www.betterevaluation.org/" target="_blank" rel="noopener noreferrer">BetterEvaluation</a> is the most practical open resource for designing the third tier without a research budget.</p>

<h2>Attribution: say what you cannot know</h2>

<p>The hardest question in campaign measurement is whether the change would have happened anyway. Rigorous answers require comparison groups that most organisations cannot construct.</p>

<p>The honest response is not to fake precision but to state the limit. "Service uptake rose 18% in the broadcast area over the campaign period. Uptake in the comparison district rose 6%. We cannot rule out other factors, including the clinic staffing change in March." That paragraph is more credible than any confident attribution claim, and funders who know the field read it as competence rather than weakness.</p>

<h2>Metrics that quietly mislead</h2>

<ul>
  <li><strong>Cumulative reach across channels.</strong> The same person counted four times is not four people. If you must aggregate, say that overlap is unremoved.</li>
  <li><strong>Impressions.</strong> Counts renders, not readers. It is the number most easily inflated by spend.</li>
  <li><strong>Follower growth.</strong> Measures account performance, not campaign effect.</li>
  <li><strong>Media value equivalence.</strong> Converting coverage into a notional advertising cost invents money that was never spent or earned. Avoid entirely.</li>
  <li><strong>Attendance at your own events.</strong> Measures convening ability. Rarely measures persuasion.</li>
</ul>

<h2>Design measurement before the campaign, not after</h2>

<p>Retrospective measurement can only use whatever data happened to be collected, which is why so many reports fall back on distribution figures. Deciding beforehand what would count as evidence takes an afternoon and changes what is possible.</p>

<p>Three questions to settle in advance: what specifically should be different, for whom, and by when? What would we observe if it worked, and what would we observe if it did not? What is the baseline, and have we actually recorded it?</p>

<p>That last one is where most measurement plans die. A baseline is only obtainable before you start.</p>

<h2>Reporting honestly is a strategic choice</h2>

<p>There is short-term cost in reporting a modest, defensible figure while others report large, soft ones. The compensation is that your numbers survive scrutiny, and over several cycles that becomes the reputation that wins work.</p>

<p>It also improves the work itself. A campaign measured by distribution optimises for distribution. A campaign measured by change is forced to think about what would actually produce it — which is the harder and more useful question, and the one running through <a href="/en/blog/humanitarian-storytelling-failing">why humanitarian storytelling keeps failing its subjects</a>.</p>

<p>For channels where reach data is inherently soft, see <a href="/en/blog/community-radio-partnerships">the field guide to community radio partnerships</a>, and for measuring response under pressure, <a href="/en/blog/crisis-communications-plan">building a crisis communications plan that survives contact</a>.</p>

<h2>Common questions</h2>

<h3>What is the single most useful metric?</h3>
<p>An action that costs the audience something — a call, a visit, a request, a registration. Effort is the cheapest available proxy for attention.</p>

<h3>How do you measure a campaign with no digital component?</h3>
<p>Short structured surveys at fixed points, service records from partner organisations, and comparison against a similar area not covered. Slower, and often more reliable than platform analytics.</p>

<h3>What should a report include when results are weak?</h3>
<p>The result, the likely explanation, and what you would change. Funders fund learning; they defund the appearance of certainty that later collapses.</p>

<p>If you want a measurement framework built before your next campaign rather than after it, <a href="/en/contact">let us talk</a>.</p>
`,
  },
];

// ── Apply ───────────────────────────────────────────────────────────────────

import { writeFileSync, unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const target = process.argv.includes("--remote") ? "--remote" : "--local";

  // Reuse the real scorer rather than reimplementing it here, so the numbers
  // shown in the dashboard match what the editor calculates on save. The
  // sources use the "@/" tsconfig alias, which Node cannot resolve, so they
  // are copied to a temp directory with the alias rewritten to a relative path.
  const { mkdtempSync, copyFileSync, readFileSync, writeFileSync: write } = await import("node:fs");
  const shim = mkdtempSync(path.join(tmpdir(), "seed-lib-"));
  copyFileSync("lib/sanitize-html.ts", path.join(shim, "sanitize-html.ts"));
  write(
    path.join(shim, "seo-score.ts"),
    readFileSync("lib/seo-score.ts", "utf8").replace('@/lib/sanitize-html', './sanitize-html.ts'),
  );

  const { analyzeSeo } = await import(pathToFileURL(path.join(shim, "seo-score.ts")).href);
  const { sanitizeHtml, htmlToText } = await import(pathToFileURL(path.join(shim, "sanitize-html.ts")).href);

  const q = (v) => (v === null || v === undefined ? "NULL" : `'${String(v).replaceAll("'", "''")}'`);
  const id = (p) =>
    `${p}_${[...crypto.getRandomValues(new Uint8Array(8))].map((b) => b.toString(16).padStart(2, "0")).join("")}`;
  const slugify = (s) =>
    s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

  const statements = [];
  const summary = [];

  for (const a of ARTICLES) {
    const content = sanitizeHtml(a.body.trim());
    const words = htmlToText(content).split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / 225));

    const analysis = analyzeSeo({
      title: a.title,
      slug: a.slug,
      content,
      excerpt: a.excerpt,
      metaTitle: a.metaTitle,
      metaDescription: a.metaDescription,
      focusKeyword: a.focusKeyword,
      coverImageAlt: "",
    });

    // Matched on slug; the slug column is never written, so URLs cannot move.
    statements.push(
      `UPDATE posts SET
         title = ${q(a.title)},
         excerpt = ${q(a.excerpt)},
         content = ${q(content)},
         meta_title = ${q(a.metaTitle)},
         meta_description = ${q(a.metaDescription)},
         focus_keyword = ${q(a.focusKeyword)},
         reading_minutes = ${minutes},
         seo_score = ${analysis.score},
         updated_at = datetime('now')
       WHERE slug = ${q(a.slug)};`,
    );

    statements.push(
      `DELETE FROM post_tags WHERE post_id = (SELECT id FROM posts WHERE slug = ${q(a.slug)});`,
    );
    for (const tag of a.tags) {
      statements.push(
        `INSERT OR IGNORE INTO tags (id, slug, name) VALUES (${q(id("tag"))}, ${q(slugify(tag))}, ${q(tag)});`,
      );
      statements.push(
        `INSERT OR IGNORE INTO post_tags (post_id, tag_id)
           SELECT p.id, t.id FROM posts p, tags t
            WHERE p.slug = ${q(a.slug)} AND t.slug = ${q(slugify(tag))};`,
      );
    }

    summary.push({ slug: a.slug, words, minutes, score: analysis.score, grade: analysis.grade });
  }

  const file = path.join(tmpdir(), `seed-articles-${Date.now()}.sql`);
  writeFileSync(file, statements.join("\n"));

  try {
    const result = spawnSync(
      "npx",
      ["wrangler", "d1", "execute", "olga-db", `--file=${file}`, target, "--yes"],
      { stdio: ["inherit", "pipe", "pipe"], encoding: "utf8" },
    );
    if (result.status !== 0) {
      console.error(result.stderr || result.stdout);
      process.exit(1);
    }
  } finally {
    unlinkSync(file);
  }

  console.log(`\nUpdated ${ARTICLES.length} articles on the ${target.replace("--", "")} database.\n`);
  for (const s of summary) {
    console.log(`  ${String(s.score).padStart(3)}  ${s.grade.padEnd(11)} ${String(s.words).padStart(4)}w  ${s.minutes}min  /${s.slug}`);
  }
  console.log("\nSlugs were matched, never written — every existing URL is unchanged.");
}
