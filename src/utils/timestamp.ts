import dayjs, { Dayjs } from 'dayjs'
import { Blue as B } from '../blue-types'
import { getFirestoreClass } from './module'

export class MTimestamp {
    static toDayjs(timestamp: B.Timestamp) {
        return dayjs(timestamp.toDate())
    }

    static serialize(timestamp: B.Timestamp) {
        return timestamp.toDate().toISOString()
    }

    static deserialize(isoString: string, admin: boolean) {
        const Class = getFirestoreClass(admin)
        return Class.Timestamp.fromDate(new Date(isoString))
    }

    static where({
        field,
        order,
        since,
        until,
    }: {
        field: string
        order: 'asc' | 'desc'
        since?: Dayjs
        until?: Dayjs
    }) {
        return <Q extends B.Query>(q: Q) => {
            let _q = q as B.Query

            if (since) {
                _q = _q.where(field, '>=', since.toDate())
            }
            if (until) {
                _q = _q.where(field, '<', until.toDate())
            }

            return _q.orderBy(field, order) as Q
        }
    }
}
