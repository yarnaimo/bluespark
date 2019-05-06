import { t } from '@yarnaimo/rain'
import { FirestoreDocumentReference } from '../firestore'

const is = (u: unknown): u is FirestoreDocumentReference =>
    typeof u === 'object' && u !== null && 'collection' in u

export const DocumentReference = new t.Type<
    FirestoreDocumentReference,
    FirestoreDocumentReference,
    unknown
>('DocumentReference', is, (u, c) => (is(u) ? t.success(u) : t.failure(u, c)), t.identity)
