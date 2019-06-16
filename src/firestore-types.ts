import { firestore } from 'firebase'
import { admin } from './firestore-admin'

export type FirestoreFieldValue = firestore.FieldValue | admin.FieldValue
export type FirestoreDocumentReference = firestore.DocumentReference | admin.DocumentReference
export type FirestoreDocumentSnapshot = firestore.DocumentSnapshot | admin.DocumentSnapshot
export type FirestoreRoot = firestore.Firestore | admin.Firestore
