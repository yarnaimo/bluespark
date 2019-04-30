import { t } from '@yarnaimo/rain'
import { firestore } from 'firebase'

type ExcludeFieldValue<T> = {
    [K in keyof T]: ExcludeFieldValue<Exclude<T[K], firestore.FieldValue>>
}

export const blue = <P extends t.Props>(type: t.TypeC<P>) => {
    const partial = t.partial(type.props)

    return {
        in: (doc: firestore.DocumentSnapshot) => {
            const data = doc.data()
            const result = type.decode(data as any)

            if (result.isLeft()) {
                return undefined
            }

            return result.value as ExcludeFieldValue<(typeof type)['_A']>
        },
        out: (doc: firestore.DocumentReference) => {
            return {
                set: async (data: (typeof type)['_A']) => doc.set(type.encode(data)),

                setMerge: async (data: (typeof partial)['_A']) =>
                    doc.set(partial.encode(data), { merge: true }),

                update: async (data: (typeof partial)['_A']) => doc.update(partial.encode(data)),
            }
        },
    }
}
