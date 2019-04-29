import { t } from '@yarnaimo/rain'
import day, { Dayjs, isDayjs } from 'dayjs'
import { firestore } from 'firebase'

export class DayjsFromFirestoreTimestampType extends t.Type<Dayjs, firestore.Timestamp, t.mixed> {
    readonly _tag = 'DayjsFromFirestoreTimestampType' as const
    constructor() {
        super(
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
    }
}

export interface DayjsFromFirestoreTimestampC extends DayjsFromFirestoreTimestampType {}

export const DayjsFromFirestoreTimestamp: DayjsFromFirestoreTimestampC = new DayjsFromFirestoreTimestampType()
