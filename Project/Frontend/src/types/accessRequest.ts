import type { AuthMessageResponse } from '@/types/auth.ts'

export type SubmitAccessRequest = {
  firstName: string
  lastName: string
  email: string
  institution: string
  jobTitle: string
  additionalInformation?: string
}

export type AccessRequest = Omit<SubmitAccessRequest, 'additionalInformation'> & {
  id: number
  funktion: string
  additionalInformation: string | null
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export type SubmitAccessRequestResponse = AuthMessageResponse & { id: number }

export type ApproveAccessRequestResponse = AuthMessageResponse & {
  setPasswordToken: string
  setPasswordLink: string
}
