import { firestore } from 'firebase'
import { firestore as admin } from 'firebase-admin'
export { firestore, admin }

export type FirestoreFieldValue = firestore.FieldValue | admin.FieldValue
