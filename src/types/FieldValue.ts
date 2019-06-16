import { t } from '@yarnaimo/rain'
import { FirestoreFieldValue } from '../firestore-types'

const is = (u: unknown): u is FirestoreFieldValue =>
    typeof u === 'object' && u !== null && 'isEqual' in u

export const FieldValue = new t.Type<FirestoreFieldValue, FirestoreFieldValue, unknown>(
    'FieldValue',
    is,
    (u, c) => (is(u) ? t.success(u) : t.failure(u, c)),
    t.identity,
)
