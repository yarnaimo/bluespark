import { t } from '@yarnaimo/rain'
import { admin, firestore, FirestoreFieldValue } from './firestore'

type ExcludeFieldValue<T> = {
    [K in keyof T]: ExcludeFieldValue<Exclude<T[K], FirestoreFieldValue>>
}

export const blue = <P extends t.Props>(type: t.TypeC<P>) => {
    const partial = t.partial(type.props)

    const ss = (snapshot: firestore.DocumentSnapshot | admin.DocumentSnapshot) => {
        const data = snapshot.data()
        const result = type.decode(data as any)

        if (result.isLeft()) {
            return undefined
        }

        return result.value as ExcludeFieldValue<t.TypeC<P>>
    }

    const fn = (doc: firestore.DocumentReference | admin.DocumentReference) => ({
        get: async () => {
            const snapshot = await doc.get()
            return ss(snapshot)
        },

        set: async (data: t.TypeOf<typeof type>) => doc.set(type.encode(data)),

        setMerge: async (data: t.TypeOf<typeof partial>) =>
            doc.set(partial.encode(data), { merge: true }),

        update: async (data: t.TypeOf<typeof partial>) => doc.update(partial.encode(data)),
    })

    return Object.assign(fn, {
        ss,
        type,
    }) as typeof fn & {
        ss: typeof ss
        type: typeof type
    }
}
