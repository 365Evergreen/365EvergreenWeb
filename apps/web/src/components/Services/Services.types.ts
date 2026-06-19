export interface ServiceItem {
  title: string
  description: string
  linkTo: string
  linkLabel: string
}

export interface ServicesProps {
  heading: string
  services: ServiceItem[]
}
