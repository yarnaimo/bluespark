import { t } from '@yarnaimo/rain'
import day, { Dayjs, isDayjs } from 'dayjs'
import { admin, firestore } from '../firestore'

export const DayjsFromFirestoreTimestamp = new t.Type<
    Dayjs,
    firestore.Timestamp | admin.Timestamp,
    unknown
>(
    'DayjsFromFirestoreTimestamp',
    isDayjs,
    (u, c) => {
        if (!(u instanceof firestore.Timestamp)) {
            return t.failure(u, c)
        } else {
            const d = day(u.toDate())
            return !d.isValid() ? t.failure(u, c) : t.success(d)
        }
    },
    a => firestore.Timestamp.fromDate(a.toDate()),
)
