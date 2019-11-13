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
    }: {
        model: S
        doc: BlueW.DocumentReference | string
        decoder?: DF
    }) => {
        const _ref = getDocRef(
            model.collectionRef,
            doc,
        ) as BlueW.DocumentReference
        const [snapshot, loading, error] = _useDocument(_ref)
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
    }: {
        model: S
        q?: (collection: BlueW.Query) => BlueW.Query
        decoder?: DF
    }) => {
        const query = q(model.collectionRef as BlueW.CollectionReference)

        const [querySnapshot, loading, error] = _useCollection(query)
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
