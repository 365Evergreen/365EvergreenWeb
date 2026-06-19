import Contact from '../components/Contact'
import EvergreenMoment from '../components/EvergreenMoment'
import Hero from '../components/Hero'
import HomepageCta from '../components/HomepageCta'
import LatestPosts from '../components/LatestPosts'
import Outcome from '../components/Outcome'
import ProblemGrid from '../components/ProblemGrid'
import Services from '../components/Services'

export default function HomePage() {
  const problemCards = [
    {
      title: 'Files everywhere',
      description: "You can't find what you need when you need it.",
    },
    {
      title: 'Manual processes',
      description: 'Constant repetition drains time and energy.',
    },
    {
      title: 'Disconnected tools',
      description: 'Nothing syncs, so context gets lost between tools.',
    },
  ]

  const outcomePoints = [
    {
      title: 'Everything has a place',
      description: 'Information is easy to find because structure is clear and consistent.',
    },
    {
      title: 'Processes run automatically',
      description: 'Routine tasks happen in the background, freeing your team for priority work.',
    },
    {
      title: 'Systems support your team',
      description: 'Your tools work together in ways that keep people focused and moving forward.',
    },
  ]

  const services = [
    {
      title: 'Information architecture',
      description:
        'Create clear structure so people can find what they need without second-guessing.',
      linkTo: '/platform',
      linkLabel: 'Explore information architecture',
    },
    {
      title: 'Process automation',
      description:
        'Reduce repetitive work with practical workflows that save time every day.',
      linkTo: '/platform',
      linkLabel: 'Explore process automation',
    },
    {
      title: 'Modern intranet',
      description:
        'Build a central digital workplace that people trust and actually use.',
      linkTo: '/platform',
      linkLabel: 'Explore modern intranet',
    },
    {
      title: 'Governance',
      description:
        'Set clear ownership and guardrails so your environment stays reliable as you grow.',
      linkTo: '/platform',
      linkLabel: 'Explore governance',
    },
  ]

  const latestPosts = [
    {
      title: 'Why workplace clarity is now a leadership issue',
      excerpt: 'How clearer structure reduces friction and helps teams make better decisions.',
      meta: 'Insight • 18/06/2026',
      linkTo: '/blog',
    },
    {
      title: 'A practical path from scattered files to trusted knowledge',
      excerpt: 'An outcome-first approach to organising information without overengineering.',
      meta: 'Guide • 12/06/2026',
      linkTo: '/blog',
    },
    {
      title: 'What to automate first when teams are stretched',
      excerpt: 'Start small with repeatable tasks that create immediate breathing room.',
      meta: 'Playbook • 05/06/2026',
      linkTo: '/blog',
    },
  ]

  return (
    <div className="page-shell">
      <Hero
        title="Stay ahead with 365 Evergreen updates and guidance"
        subtitle="Track change, reduce surprises, and communicate with confidence through a practical, searchable knowledge hub."
        ctaLabel="See how it works"
        ctaLink="/platform"
        imageSrc="/plant-cover-1440-900.webp"
        imageAlt="Green plant stems in a glass vase on a white surface"
      />

      <ProblemGrid
        heading="Work shouldn't feel this hard"
        cards={problemCards}
        conclusion="Most organisations outgrow their setup."
      />

      <Outcome
        heading="Imagine a workplace that just flows"
        points={outcomePoints}
      />

      <Services
        heading="We make Microsoft 365 work properly"
        services={services}
      />

      <EvergreenMoment
        heading="The Evergreen moment"
        statement="Good systems don't happen by accident."
        detail="They emerge from clear decisions, thoughtful structure, and steady guidance over time."
      />

      <LatestPosts
        heading="Latest insights"
        posts={latestPosts}
        viewAllLabel="View all insights"
        viewAllLink="/blog"
      />

      <Contact
        heading="Have a question?"
        supportingText="Get in touch if you want to explore options or sense-check your current setup."
        emailAddress="hello@365evergreen.com"
      />

      <HomepageCta
        heading="Ready to bring clarity to your workplace?"
        supportingText="Let's have a conversation about what is getting in the way and what a better setup could look like."
        buttonLabel="Start a conversation"
        buttonLink="/about"
      />
    </div>
  )
}
