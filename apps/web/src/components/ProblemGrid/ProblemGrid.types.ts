export interface ProblemCard {
  title: string
  description: string
}

export interface ProblemGridProps {
  heading: string
  cards: ProblemCard[]
  conclusion: string
}
