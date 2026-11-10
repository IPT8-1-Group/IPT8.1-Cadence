export type Grobplanung = {
  id: number
  title: string
  desc: string | null
  fk_course: number
}

export type UpdateGrobplanungRequest = {
  title: string
  desc?: string | null
}

export type CreateGrobplanungRequest = UpdateGrobplanungRequest & {
  fk_course: number
}
