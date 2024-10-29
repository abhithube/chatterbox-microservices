export type Party = {
  id: string
  title: string
}

export type PartyDetails = {
  id: string
  title: string
  topics: Topic[]
  members: Member[]
}

export type Topic = {
  id: string
  title: string
}

export type Member = {
  id: string
  name: string
  image: string | null
  isAdmin: boolean
}
