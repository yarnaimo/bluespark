import { PathReporter, t } from '@yarnaimo/rain'
import {
    FirestoreDocumentReference,
    FirestoreDocumentSnapshot,
    FirestoreFieldValue,
    FirestoreRoot,
} from './firestore'

export type ExcludeFieldValue<T> = { [K in keyof T]: NonFieldValue<T[K]> }

export type NonFieldValue<V> = V extends {}
    ? V extends (...args: any[]) => any
        ? V
        : ExcludeFieldValue<Exclude<V, FirestoreFieldValue>>
    : V

export const blue = <P extends t.Props, ACS extends t.TypeC<any>[] = [t.TypeC<P>]>(
    name: string,
    codec: t.TypeC<P> | t.PartialC<P>,
    ACodecs?: ACS,
) => {
    ACodecs
    type AC_T = t.TypeOf<ACS[number]>

    const partial = t.partial(codec.props)

    const ss = (snapshot: FirestoreDocumentSnapshot) => {
        const data = snapshot.data()

        const result = codec.decode(data as any)

        return result.mapLeft(() => {
            console.error(PathReporter.report(result))
            return undefined
        }).value as ExcludeFieldValue<AC_T>
    }

    const within = <A extends FirestoreRoot | FirestoreDocumentReference>(a: A) =>
        a.collection(name) as ReturnType<A['collection']>

    const base = {
        codec: codec as t.TypeC<P>,
        _A: (codec as t.TypeC<P>)._A,
        within,
        ss,
    }

    const fn = (doc: FirestoreDocumentReference) => ({
        get: async () => {
            const snapshot = await doc.get()
            return ss(snapshot)
        },

        set: async (data: AC_T) => doc.set(codec.encode(data)),

        setMerge: async (data: Partial<AC_T>) => doc.set(partial.encode(data), { merge: true }),

        update: async (data: Partial<AC_T>) => doc.update(partial.encode(data)),
    })

    return Object.assign(fn, base) as typeof fn & typeof base
}
