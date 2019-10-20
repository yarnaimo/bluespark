import { firestore as BlueW } from 'firebase/app'
import { useMemo } from 'react'
import {
    useCollection,
    useCollectionOnce,
    useDocument,
    useDocumentOnce,
} from 'react-firebase-hooks/firestore'
import { Blue } from './blue-types'
import { SparkModel } from './spark'

type Statuses = {
    loading: boolean
    error: Error | undefined
}

type UseSDoc = {
    <I extends Blue.Interface<any>>(
        model: SparkModel<I>,
        ref: BlueW.DocumentReference,
    ): Statuses & {
        data: I['_D'] | undefined
    }

    <I extends Blue.Interface<any>, T>(
        model: SparkModel<I>,
        ref: BlueW.DocumentReference,
        decoder: (data: I['_D']) => T,
    ): Statuses & {
        data: T | undefined
    }
}

export const useSDoc: UseSDoc = <I extends Blue.Interface<any>, T = I['_D']>(
    model: SparkModel<I>,
    ref: BlueW.DocumentReference,
    decoder?: (data: I['_D']) => T,
) => {
    const [snapshot, loading, error] = useDocument(ref)
    const data = useMemo(() => snapshot && model.decode(snapshot, decoder), [
        snapshot,
        model,
        decoder,
    ])

    return { data, loading, error }
}

export const useSDocOnce: UseSDoc = <
    I extends Blue.Interface<any>,
    T = I['_D']
>(
    model: SparkModel<I>,
    ref: BlueW.DocumentReference,
    decoder?: (data: I['_D']) => T,
) => {
    const [snapshot, loading, error] = useDocumentOnce(ref)
    const data = useMemo(() => snapshot && model.decode(snapshot, decoder), [
        snapshot,
        model,
        decoder,
    ])

    return { data, loading, error }
}

//

type UseSCollection = {
    <I extends Blue.Interface<any>>(
        model: SparkModel<I>,
        query: BlueW.Query,
    ): Statuses & {
        query: BlueW.Query
        array: I['_D'][]
        map: Map<string, I['_D']>
    }

    <I extends Blue.Interface<any>, T>(
        model: SparkModel<I>,
        query: BlueW.Query,
        decoder: (data: I['_D']) => T,
    ): Statuses & {
        query: BlueW.Query
        array: T[]
        map: Map<string, T>
    }
}

const emptyDocList = <T>() => ({
    array: [] as T[],
    map: new Map() as Map<string, T>,
})

export const useSCollection: UseSCollection = <
    I extends Blue.Interface<any>,
    T = I['_D']
>(
    model: SparkModel<I>,
    query: BlueW.Query,
    decoder?: (data: I['_D']) => T,
) => {
    const [snapshot, loading, error] = useCollection(query)
    const { array, map } = useMemo(
        () =>
            snapshot
                ? model.decodeQuerySnapshot(snapshot, decoder)
                : emptyDocList<T>(),
        [snapshot, model, decoder],
    )

    return { query, array, map, loading, error }
}

export const useSCollectionOnce: UseSCollection = <
    I extends Blue.Interface<any>,
    T = I['_D']
>(
    model: SparkModel<I>,
    query: BlueW.Query,
    decoder?: (data: I['_D']) => T,
) => {
    const [snapshot, loading, error] = useCollectionOnce(query)
    const { array, map } = useMemo(
        () =>
            snapshot
                ? model.decodeQuerySnapshot(snapshot, decoder)
                : emptyDocList<T>(),
        [snapshot, model, decoder],
    )

    return { query, array, map, loading, error }
}
