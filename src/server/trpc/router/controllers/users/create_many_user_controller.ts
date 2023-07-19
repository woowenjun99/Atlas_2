import { db } from '~/server/db/admin_firebase'
import { randomUUID } from 'crypto'
import { sendMultipleEmails } from '../../member/helper'
import { adminAuth } from '~/server/db/admin_firebase'
import { userCollection } from '~/server/db/collections/admin/UserCollection'

export class CreateManyUserController {
  private async addUsers(
    input: {
      name: string
      personal_email: string
      department: string
      role: string
      nus_email: string
      student_id: string
      resume?: string | undefined
    }[],
    transaction: FirebaseFirestore.Transaction
  ) {
    /// Step 1: Clean the data by filtering until we have the valid users.
    const users = await userCollection.getAll()
    const userIds = new Set(users.map((user) => user.id))
    const userEmails = new Set(users.map((user) => user.personal_email))
    input = input.filter(
      (user) =>
        user.student_id &&
        !userIds.has(user.student_id) &&
        !userEmails.has(user.personal_email)
    )

    /// Step 2: Save the data for all the valid users.
    const emailData = await Promise.all(
      input.map(async (user) => {
        const password = randomUUID().substring(0, 10)

        await adminAuth.createUser({
          email: user.personal_email,
          displayName: user.name,
          uid: user.student_id,
          password,
        })

        userCollection.withTransaction(transaction).set(
          {
            department: user.department,
            email: user.nus_email,
            name: user.name,
            isAdmin: false,
            id: user.student_id,
            role: user.role,
            resume: user.resume || '',
            personal_email: user.personal_email,
          },
          user.student_id
        )

        return {
          id: user.student_id,
          email: user.personal_email,
          password,
        }
      })
    )

    await sendMultipleEmails(emailData)

    return emailData.map((data) => data.id)
  }

  async execute(
    input: {
      name: string
      personal_email: string
      department: string
      role: string
      nus_email: string
      student_id: string
      resume?: string | undefined
    }[],
    transaction?: FirebaseFirestore.Transaction
  ) {
    if (transaction) {
      return await this.addUsers(input, transaction)
    }
    return await db.runTransaction((transaction) =>
      this.addUsers(input, transaction)
    )
  }
}