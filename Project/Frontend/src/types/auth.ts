export type AuthMessageResponse = {
  message: string
}

export type UserRole = 'user' | 'admin'

export type User = {
  id: number
  email: string
  role: UserRole
  active: boolean | 0 | 1
  firstName: string | null
  lastName: string | null
  institution: string | null
  jobTitle: string | null
  funktion: string | null
  createdAt?: string | null
}

export type LoginResponseType = AuthMessageResponse & {
  token: string
  private_key: string
  user: User
}

export type MeResponse = { user: User }

export type RegisterRequest = {
  email: string
  password: string
  role?: UserRole
  firstName?: string
  lastName?: string
  institution?: string
  jobTitle?: string
}

export type RegisterResponse = AuthMessageResponse & { id: number }
