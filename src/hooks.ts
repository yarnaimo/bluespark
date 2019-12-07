import { firestore as BlueW } from 'firebase/app'
import { prray } from 'prray'
import { useMemo } from 'react'
import {
    useCollection,
    useCollectionOnce,
    useDocument,
    useDocumentOnce,
} from 'react-firebase-hooks/firestore'
import { DFType, DXType, SparkQueryType, SparkType } from './spark'
import { getDocRef } from './utils'

export const createUseDocument = (
    _useDocument: typeof useDocument | typeof useDocumentOnce,
) => {
    return <
        S extends SparkType<any>,
        I extends S['__I__'] = S['__I__'],
        DF extends DFType<I> = undefined
    >(
        collection: S,
        {
            doc,
            decoder,
            listen = true,
        }: {
            doc: BlueW.DocumentReference | string
            decoder?: DF
            listen?: boolean
        },
    ) => {
        const _ref = getDocRef(
            collection.collectionRef,
            doc,
        ) as BlueW.DocumentReference
        const [snapshot, loading, error] = _useDocument(listen ? _ref : null)
        const data = useMemo(
            () =>
                snapshot &&
                collection._decode<DXType<I, DF>>(snapshot, decoder),
            [snapshot, collection, decoder],
        )

        return { data, loading, error }
    }
}

export const useSDoc = createUseDocument(useDocument)
export const useSDocOnce = createUseDocument(useDocumentOnce)

export const createUseCollection = (
    _useCollection: typeof useCollection | typeof useCollectionOnce,
) => {
    return <
        S extends SparkQueryType<any>,
        I extends S['__I__'] = S['__I__'],
        DF extends DFType<I> = undefined
    >(
        collection: S | null | undefined,
        {
            q = a => a,
            decoder,
            listen = true,
        }: {
            q?: (collection: BlueW.Query) => BlueW.Query
            decoder?: DF
            listen?: boolean
        },
    ) => {
        const query =
            collection &&
            q(collection.collectionRef as BlueW.CollectionReference)

        const [querySnapshot, loading, error] = _useCollection(
            listen ? query : null,
        )
        const docs = useMemo(() => {
            if (collection && query) {
                return collection._decodeQuerySnapshot<DXType<I, DF>>(
                    query,
                    querySnapshot,
                    decoder,
                )
            }
            return {
                query: undefined,
                array: prray<DXType<I, DF>>([]),
                map: new Map<string, DXType<I, DF>>(),
            }
        }, [querySnapshot, collection, decoder])

        return { ...docs, query: docs.query, loading, error }
    }
}

export const useSCollection = createUseCollection(useCollection)
export const useSCollectionOnce = createUseCollection(useCollectionOnce)
