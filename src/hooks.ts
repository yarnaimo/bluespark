import { useEffect, useMemo } from 'react'
import { useCollection, useDocument } from 'react-firebase-hooks/firestore'
import { Blue } from '.'
import { QueryFn, Spark } from './spark'

export const useDoc = <M extends Spark<'web', any, any>>(
    model?: M,
    docId?: string,
) => {
    if (!model) {
        return undefined
    }

    const _model = model as Spark<'web', M['_T'], M['_L']>
    const ref = useMemo(() => _model.ref.doc(docId), [_model.ref.path, docId])
    const [docSnapshot, loading, error] = useDocument(ref as Blue.DocRef['web'])

    useEffect(() => error && console.error(error), [error])

    return useMemo(() => _model._decode(docSnapshot) as M['_D'] | undefined, [
        docSnapshot,
    ])
}

export const useQuery = <M extends Spark<'web', any, any>>(
    model?: M,
    queryFn: QueryFn<'web'> = c => c,
) => {
    const empty = [[], undefined] as const

    if (!model) {
        return empty
    }

    const _model = model as Spark<'web', M['_T'], M['_L']>
    const queryRef = useMemo(
        () => queryFn(_model.ref as Blue.CollectionRef['web']),
        [_model.ref.path, queryFn],
    )
    const [querySnapshot, loading, error] = useCollection(queryRef)

    useEffect(() => error && console.error(error), [error])

    return useMemo(
        () =>
            querySnapshot
                ? (_model._querySnap(
                      querySnapshot as Blue.QuerySnapshot['web'],
                  ) as [M['_D'][], firebase.firestore.QuerySnapshot])
                : empty,
        [querySnapshot],
    )
}
