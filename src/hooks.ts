import { firestore as BlueW } from 'firebase/app'
import { useMemo } from 'react'
import {
    useCollection,
    useCollectionOnce,
    useDocument,
    useDocumentOnce,
} from 'react-firebase-hooks/firestore'
import { DFType, DXType, getDocRef, SparkQueryType, SparkType } from './spark'

export const createUseDocument = (
    _useDocument: typeof useDocument | typeof useDocumentOnce,
) => {
    return <
        S extends SparkType<any>,
        I extends S['__I__'] = S['__I__'],
        DF extends DFType<I> = undefined
    >({
        model,
        doc,
        decoder,
        listen = true,
    }: {
        model: S
        doc: BlueW.DocumentReference | string
        decoder?: DF
        listen?: boolean
    }) => {
        const _ref = getDocRef(
            model.collectionRef,
            doc,
        ) as BlueW.DocumentReference
        const [snapshot, loading, error] = _useDocument(listen ? _ref : null)
        const data = useMemo(
            () => snapshot && model._decode<DXType<I, DF>>(snapshot, decoder),
            [snapshot, model, decoder],
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
    >({
        model,
        q = a => a,
        decoder,
        listen = true,
    }: {
        model: S
        q?: (collection: BlueW.Query) => BlueW.Query
        decoder?: DF
        listen?: boolean
    }) => {
        const query = q(model.collectionRef as BlueW.CollectionReference)

        const [querySnapshot, loading, error] = _useCollection(
            listen ? query : null,
        )
        const docs = useMemo(
            () =>
                model._decodeQuerySnapshot<DXType<I, DF>>(
                    query,
                    querySnapshot,
                    decoder,
                ),
            [querySnapshot, model, decoder],
        )

        return { ...docs, loading, error }
    }
}

export const useSCollection = createUseCollection(useCollection)
export const useSCollectionOnce = createUseCollection(useCollectionOnce)
