import is from '@sindresorhus/is'
import { firestore as BlueA } from 'firebase-admin'
import { firestore as BlueW } from 'firebase/app'
import 'firebase/firestore'
import { Blue as B } from './blue-types'

let _BlueAdmin: typeof BlueA

const getBlueAdmin = () => {
    if (!_BlueAdmin) {
        _BlueAdmin = require('firebase-admin').firestore
    }

    return _BlueAdmin
}

export const withMeta = (
    action: 'create' | 'update',
    docRef: B.DocRef,
    data: B.DocData,
) => {
    const serverTimestamp =
        docRef instanceof BlueW.DocumentReference
            ? BlueW.FieldValue.serverTimestamp()
            : getBlueAdmin().FieldValue.serverTimestamp()

    const copied = { ...data }

    delete copied._id
    delete copied._ref
    delete copied._createdAt
    delete copied._updatedAt

    if (action === 'create') {
        return {
            ...copied,
            _createdAt: serverTimestamp,
            _updatedAt: serverTimestamp,
        }
    } else {
        return {
            ...copied,
            _updatedAt: serverTimestamp,
        }
    }
}

export const getDocRef = (
    collectionRef: B.CollectionRef,
    doc: B.DocRef | string,
) => (is.string(doc) ? collectionRef.doc(doc) : doc)

type PT<FR> = FR extends true ? B.Firestore : B.Firestore | B.DocRef

export const SparkQuery = <I extends B.Interface<any>>() => {
    return <FR extends boolean, P extends PT<FR> = PT<FR>>(
        onlyFromRoot: FR,
        collectionFn: (parent: P) => B.Query,
    ) => {
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
            decoder: (data: I['_D']) => T = data => data,
        ) => {
            if (!snapshot.exists) {
                return undefined as any
            }

            return decoder({
                ...snapshot.data()!,
                _id: snapshot.id,
                _ref: snapshot.ref,
            })
        }

        const _decodeQuerySnapshot = <T = I['_D']>(
            { docs }: B.QuerySnapshot,
            decoder?: (data: I['_D']) => T,
        ) => {
            const array: T[] = []
            const dataEntries: [string, T][] = []

            for (const doc of docs) {
                const decoded = _decode(doc, decoder)
                array.push(decoded)
                dataEntries.push([doc.id, decoded])
            }
            const map = new Map(dataEntries)
            return { array, map }
        }

        return <P2 extends P>(parent: P2) => {
            type Query = ReturnType<ReturnType<P2['collection']>['where']>
            const _ref = collectionFn(parent) as Query

            const getQuery = async <T = I['_D']>(
                queryFn: (collection: Query) => B.Query = a => a,
                decoder?: (data: I['_D']) => T,
            ) => {
                const querySnapshot = await queryFn(_ref).get()
                return _decodeQuerySnapshot(querySnapshot, decoder)
            }

            return {
                __I__: {} as I,
                _decode,
                _decodeQuerySnapshot,
                _ref,
                getQuery,
            }
        }
    }
}

export const Spark = <I extends B.Interface<any>>() => {
    return <FR extends boolean, P extends PT<FR> = PT<FR>>(
        onlyFromRoot: FR,
        collectionFn: (parent: P) => B.CollectionRef,
    ) => {
        const _superCollection = SparkQuery<I>()(onlyFromRoot, collectionFn)

        return <P2 extends P>(parent: P2) => {
            type Collection = ReturnType<P2['collection']>
            const _ref = collectionFn(parent) as Collection

            const {
                _decode,
                _decodeQuerySnapshot,
                getQuery,
            } = _superCollection(parent)

            const getDoc = async <T = I['_D']>(
                id: string,
                decoder?: (data: I['_D']) => T,
            ) => {
                const docRef = _ref.doc(id)
                return _decode(await docRef.get(), decoder)
            }

            const create = (doc: B.DocRef | string, data: I['_E']) => {
                const docRef = getDocRef(_ref, doc)

                return docRef.set(withMeta('create', docRef, data))
            }

            const update = (doc: B.DocRef | string, data: Partial<I['_E']>) => {
                const docRef = getDocRef(_ref as B.CollectionRef, doc)

                return docRef.update(withMeta('update', docRef, data))
            }

            return {
                __I__: {} as I,
                _decode,
                _decodeQuerySnapshot,
                _ref,
                getDoc,
                getQuery,
                create,
                update,
            }
        }
    }
}

export class __S__<I extends B.Interface<any>> {
    Spark = Spark<I>()
    SparkQuery = SparkQuery<I>()
}

export type SparkType<I extends B.Interface<any>> = ReturnType<
    ReturnType<__S__<I>['Spark']>
>

export type SparkQueryType<I extends B.Interface<any>> = ReturnType<
    ReturnType<__S__<I>['SparkQuery']>
>
