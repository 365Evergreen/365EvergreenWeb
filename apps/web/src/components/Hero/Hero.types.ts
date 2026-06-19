export interface HeroProps {
  title: string
  subtitle?: string
  ctaLabel?: string
  ctaLink?: string
  onCtaClick?: () => void
  imageSrc: string
  imageAlt: string
}
