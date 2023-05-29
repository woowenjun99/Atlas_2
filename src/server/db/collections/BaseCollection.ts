import { db } from '../firebase'
import {
  collection,
  addDoc,
  getDoc,
  doc,
  query,
  getDocs,
  where,
  deleteDoc,
  updateDoc,
  type Transaction,
  type WithFieldValue,
  type DocumentData,
  type WhereFilterOp,
  type FieldPath,
} from 'firebase/firestore'

type Queries<T> = {
  fieldPath: keyof T
  direction: WhereFilterOp
  value: T[keyof T]
}

export abstract class BaseCollection<T> {
  protected abstract collectionName: string
  protected abstract objectName: string

  async set(payload: T, id?: string) {
    const c = id
      ? collection(db, this.collectionName, id)
      : collection(db, this.collectionName)

    return await addDoc(c, payload as WithFieldValue<DocumentData>)
  }

  async getById(id: string) {
    const docRef = doc(db, this.collectionName, id)
    const result = await getDoc(docRef)
    if (!result.exists) {
      throw Error(`The ${this.objectName} does not exist`)
    }
    return { ...result, id: result.id } as T
  }

  async queries(queries: Queries<T>[]) {
    const items = queries.map((q) => {
      return where(q.fieldPath as string | FieldPath, q.direction, q.value)
    })
    const q = query(collection(db, this.collectionName), ...items)
    const snapshots = await getDocs(q)
    return snapshots.docs.map((doc) => {
      return { ...doc.data(), id: doc.id } as T
    })
  }

  async delete(id: string) {
    await deleteDoc(doc(db, this.collectionName, id))
  }

  async update(id: string, payload: Partial<T>) {
    await updateDoc(
      doc(db, this.collectionName, id),
      payload as WithFieldValue<DocumentData>
    )
  }

  withTransaction(transaction: Transaction) {
    return {
      set: (payload: T, id?: string) => {
        const docRef = id
          ? doc(db, this.collectionName, id)
          : doc(db, this.collectionName)

        transaction.set(docRef, payload as WithFieldValue<DocumentData>)
      },
      get: async (id: string) => {
        const result = await transaction.get(doc(db, this.collectionName, id))
        return { ...result.data, id: result.id }
      },
      update: (payload: Partial<T>, id: string) => {
        transaction.update(
          doc(db, this.collectionName, id),
          payload as WithFieldValue<DocumentData>
        )
      },
      delete: (id: string) => {
        transaction.delete(doc(db, this.collectionName, id))
      },
    }
  }
}