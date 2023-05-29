import type { Timestamp } from 'firebase/firestore'

type User = {
  attended: boolean
  department: string
  id: string
  name: string
  role: string
}

export type Event = {
  attendees: User[]
  endDate: Timestamp
  hasStarted: boolean
  id: string
  invitedAttendees: User[]
  name: string
  qrCode?: string
  startDate: Timestamp
}
