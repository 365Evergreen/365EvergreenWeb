export interface LatestPostItem {
  title: string
  excerpt?: string
  meta?: string
  linkTo: string
}

export interface LatestPostsProps {
  heading: string
  posts: LatestPostItem[]
  viewAllLabel?: string
  viewAllLink?: string
}
