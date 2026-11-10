export type AuthMessageResponse = {
  message: string
}

export type LoginResponseType = AuthMessageResponse & {
  private_key: string
}
