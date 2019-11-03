import { firestore as BlueW } from 'firebase/app'
import { useMemo } from 'react'
import {
    useCollection,
    useCollectionOnce,
    useDocument,
    useDocumentOnce,
} from 'react-firebase-hooks/firestore'
import { getDocRef, SparkQueryType, SparkType } from './spark'

export const createUseDocument = (
    _useDocument: typeof useDocument | typeof useDocumentOnce,
) => {
    return <
        S extends SparkType<any>,
        I extends S['__I__'] = S['__I__'],
        DF extends ((data: I['_D']) => any) | undefined = undefined
    >(
        S: S,
        doc: BlueW.DocumentReference | string,
        decoder?: DF,
    ) => {
        type D2 = DF extends Function ? ReturnType<DF> : I['_D']

        const docRef = getDocRef(S._ref, doc) as BlueW.DocumentReference
        const [snapshot, loading, error] = _useDocument(docRef)
        const data = useMemo(
            () => snapshot && S._decode<D2>(snapshot, decoder),
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
        DF extends ((data: I['_D']) => any) | undefined = undefined
    >(
        S: S,
        queryFn: (collection: BlueW.Query) => BlueW.Query = a => a,
        decoder?: DF,
    ) => {
        type D2 = DF extends Function ? ReturnType<DF> : I['_D']

        const [snapshot, loading, error] = _useCollection(
            queryFn(S._ref as BlueW.CollectionReference),
        )
        const { array, map } = useMemo(
            () =>
                snapshot
                    ? S._decodeQuerySnapshot<D2>(snapshot, decoder)
                    : emptyDocList<D2>(),
            [snapshot, S, decoder],
        )

        return { array, map, loading, error }
    }
}

export const useSCollection = createUseCollection(useCollection)
export const useSCollectionOnce = createUseCollection(useCollectionOnce)
