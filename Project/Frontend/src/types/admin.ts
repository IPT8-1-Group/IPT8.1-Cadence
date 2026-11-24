import type { User } from '@/types/auth.ts'

export type UpdateUserRequest = Partial<
  Pick<User, 'firstName' | 'lastName' | 'institution' | 'jobTitle' | 'role'>
> & { active?: boolean }
