import { router } from '~/server/trpc/trpc'
import { updateAppliedRoleStatus, updateInterviewNotes, updateAppliedRoleFlag } from './update'
import {
  getAllApplicantsTopRoleByDept,
  getApplicant,
  getAppliedRole,
} from './read'

export const recruitmentRouter = router({
  updateAppliedRoleStatus,
  updateInterviewNotes,
  updateAppliedRoleFlag,
  getAllApplicantsTopRoleByDept,
  getApplicant,
  getAppliedRole,
})