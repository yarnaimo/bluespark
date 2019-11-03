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
    >(
        S: S,
        doc: BlueW.DocumentReference | string,
        decoder?: DF,
    ) => {
        const dRef = getDocRef(S.cRef, doc) as BlueW.DocumentReference
        const [snapshot, loading, error] = _useDocument(dRef)
        const data = useMemo(
            () => snapshot && S._decode<DXType<I, DF>>(snapshot, decoder),
            [snapshot, S, decoder],
        )

        return { data, loading, error }
    }
}

export const useSDoc = createUseDocument(useDocument)
export const useSDocOnce = createUseDocument(useDocumentOnce)

const emptyDocList = <T>() => ({
    array: [] as T[],
    map: new Map() as Map<string, T>,
})

export const createUseCollection = (
    _useCollection: typeof useCollection | typeof useCollectionOnce,
) => {
    return <
        S extends SparkQueryType<any>,
        I extends S['__I__'] = S['__I__'],
        DF extends DFType<I> = undefined
    >(
        S: S,
        queryFn: (collection: BlueW.Query) => BlueW.Query = a => a,
        decoder?: DF,
    ) => {
        const [snapshot, loading, error] = _useCollection(
            queryFn(S.cRef as BlueW.CollectionReference),
        )
        const { array, map } = useMemo(
            () =>
                snapshot
                    ? S._decodeQuerySnapshot<DXType<I, DF>>(snapshot, decoder)
                    : emptyDocList<DXType<I, DF>>(),
            [snapshot, S, decoder],
        )

        return { array, map, loading, error }
    }
}

export const useSCollection = createUseCollection(useCollection)
export const useSCollectionOnce = createUseCollection(useCollectionOnce)
