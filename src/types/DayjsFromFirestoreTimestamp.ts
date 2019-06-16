import { t } from '@yarnaimo/rain'
import day, { Dayjs, isDayjs } from 'dayjs'
import { firestore } from 'firebase'
import { admin } from '../firestore-admin'

const isTimestamp = (u: unknown): u is firestore.Timestamp | admin.Timestamp =>
    typeof u === 'object' && u !== null && 'seconds' in u && 'toMillis' in u

export const DayjsFromFirestoreTimestamp = new t.Type<
    Dayjs,
    firestore.Timestamp | admin.Timestamp,
    unknown
>(
    'DayjsFromFirestoreTimestamp',
    isDayjs,
    (u, c) => {
        if (isTimestamp(u)) {
            const d = day(u.toDate())
            return !d.isValid() ? t.failure(u, c) : t.success(d)
        } else {
            return t.failure(u, c)
        }
    },
    a => a.toDate() as any,
)
