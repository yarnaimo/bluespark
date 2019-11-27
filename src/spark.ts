import { firestore as BlueW } from 'firebase/app'
import 'firebase/firestore'
import { prray } from 'prray'
import { Blue as B } from './blue-types'
import { getDocRef, withMeta } from './utils'

type PT<FR> = FR extends true ? B.Firestore : B.Firestore | B.DocRef

export type DFType<I extends B.Interface<{}>> =
    | ((data: I['_D']) => any)
    | undefined

export type DXType<
    I extends B.Interface<{}>,
    DF extends DFType<I>
> = DF extends Function ? ReturnType<DF> : I['_D']

export const SparkQuery = <I extends B.Interface<{}>>() => {
    return <FR extends boolean, P extends PT<FR> = PT<FR>>({
        root,
        query,
    }: {
        root: FR
        query: (parent: P) => B.Query
    }) => {
        type DecodeFn = {
            <T = I['_D']>(
                snapshot: B.QueryDocSnapshot,
                decoder?: (data: I['_D']) => T,
            ): T

            <T = I['_D']>(
                snapshot: B.DocSnapshot,
                decoder?: (data: I['_D']) => T,
            ): T | undefined
        }

        const _decode: DecodeFn = <T = I['_D']>(
            snapshot: B.DocSnapshot,
            decoder: (data: I['_D']) => T = data => data as any,
        ) => {
            if (!snapshot.exists) {
                return undefined as any
            }

            return decoder({
                ...snapshot.data()!,
                _id: snapshot.id,
                _path: snapshot.ref.path,
                _ref: snapshot.ref,
            } as I['_D'])
        }

        const _decodeQuerySnapshot = <T = I['_D']>(
            query: B.Query,
            querySnapshot: B.QuerySnapshot | undefined,
            decoder?: (data: I['_D']) => T,
        ) => {
            const docs = querySnapshot?.docs || []

            const array = prray<T>([])
            const map = new Map<string, T>()

            for (const doc of docs) {
                const decoded = _decode(doc, decoder)
                array.push(decoded)
                map.set(doc.id, decoded)
            }
            return { query, array, map }
        }

        return <P2 extends P>(parent: P2) => {
            type Query = ReturnType<ReturnType<P2['collection']>['where']>
            const collectionRef = query(parent) as Query

            const getQuery = async <DF extends DFType<I> = undefined>({
                q = a => a,
                decoder,
            }: {
                q?: (collection: Query) => B.Query
                decoder?: DF
            }) => {
                const queryRef = q(collectionRef)
                const querySnapshot = await queryRef.get()

                return _decodeQuerySnapshot<DXType<I, DF>>(
                    queryRef,
                    querySnapshot,
                    decoder,
                )
            }

            return {
                __I__: {} as I,
                _decode,
                _decodeQuerySnapshot,
                collectionRef,
                getQuery,
            }
        }
    }
}

export const Spark = <I extends B.Interface<{}>>() => {
    return <FR extends boolean, P extends PT<FR> = PT<FR>>({
        root,
        collection: collectionFn,
    }: {
        root: FR
        collection: (parent: P) => B.CollectionRef
    }) => {
        const _superCollection = SparkQuery<I>()({
            root,
            query: collectionFn,
        })

        return <P2 extends P>(parent: P2) => {
            type Collection = ReturnType<P2['collection']>

            const {
                _decode,
                _decodeQuerySnapshot,
                collectionRef: _collectionRef,
                getQuery,
            } = _superCollection(parent)

            const collectionRef = _collectionRef as Collection

            const getDoc = async <DF extends DFType<I> = undefined>({
                doc,
                decoder,
            }: {
                doc: BlueW.DocumentReference | string
                decoder?: DF
            }) => {
                const _ref = getDocRef(collectionRef, doc)
                return _decode<DXType<I, DF>>(await _ref.get(), decoder)
            }

            const create = async (
                doc: B.DocRef | string | null,
                data: I['_E'],
            ) => {
                const _ref = getDocRef(collectionRef, doc)

                return {
                    _ref,
                    result: await _ref.set(withMeta('create', _ref, data)),
                }
            }

            const update = async (
                doc: B.DocRef | string,
                data: Partial<I['_E']>,
            ) => {
                const _ref = getDocRef(collectionRef as B.CollectionRef, doc)

                return {
                    _ref,
                    result: await _ref.update(withMeta('update', _ref, data)),
                }
            }

            return {
                __I__: {} as I,
                _decode,
                _decodeQuerySnapshot,
                collectionRef,
                getDoc,
                getQuery,
                create,
                update,
            }
        }
    }
}

export class __S__<I extends B.Interface<{}>> {
    Spark = Spark<I>()
    SparkQuery = SparkQuery<I>()
}

export type SparkType<I extends B.Interface<{}>> = ReturnType<
    ReturnType<__S__<I>['Spark']>
>

export type SparkQueryType<I extends B.Interface<{}>> = ReturnType<
    ReturnType<__S__<I>['SparkQuery']>
>
