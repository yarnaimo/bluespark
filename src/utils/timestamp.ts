import dayjs, { Dayjs } from 'dayjs'
import { Blue as B } from '../blue-types'
import { getFirestoreClass } from './module'

export const timestampToDayjs = (timestamp: B.Timestamp) =>
    dayjs(timestamp.toDate())

export const serializeTimestamp = (timestamp: B.Timestamp) =>
    timestamp.toDate().toISOString()

export const deserializeTimestamp = (isoString: string, admin: boolean) => {
    const Class = getFirestoreClass(admin)
    return Class.Timestamp.fromDate(new Date(isoString))
}

export const filterByTimestamp = ({
    field,
    order,
    since,
    until,
}: {
    field: string
    order: 'asc' | 'desc'
    since?: Dayjs
    until?: Dayjs
}) => {
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
