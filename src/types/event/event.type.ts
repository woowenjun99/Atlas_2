export type EventInfos = {
  number: string
  name: string
  id: string
  total_users: string
  total_attendees: string
  startDate: string
  endDate: string
}

export interface BodyProps {
  attendees: number
  endDate: Date
  id?: string
  invitedAttendees: {
    attended: boolean | undefined
    department: string
    name: string
    id: string
    role: string | undefined
  }[]
  name: string
  showup: number
  qr_code: string | undefined
  startDate: Date
  departments: string[]
}
