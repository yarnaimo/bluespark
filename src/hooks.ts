import { useMemo } from 'react'
import { useCollection, useDocument } from 'react-firebase-hooks/firestore'
import { Blue } from '.'
import { QueryFn, Spark } from './spark'

export const useLeaf = <M extends Spark<'web', any, any>>(
    model: M,
    docId?: string,
) => {
    const _model = model as Spark<'web', M['_T'], M['_L']>
    const ref = useMemo(() => _model.ref.doc(docId), [docId])
    const [docSnapshot] = useDocument(ref as Blue.DocRef['web'])

    return useMemo(() => _model._decode(docSnapshot) as M['_D'] | undefined, [
        docSnapshot,
    ])
}

export const useQuery = <M extends Spark<'web', any, any>>(
    model: M,
    queryFn: QueryFn<'web'> = c => c,
) => {
    const _model = model as Spark<'web', M['_T'], M['_L']>
    const queryRef = useMemo(
        () => queryFn(_model.ref as Blue.CollectionRef['web']),
        [queryFn],
    )
    const [querySnapshot, loading, error] = useCollection(queryRef)

    return useMemo(
        () =>
            querySnapshot
                ? (_model._querySnap(
                      querySnapshot as Blue.QuerySnapshot['web'],
                  ) as [M['_D'][], firebase.firestore.QuerySnapshot])
                : [undefined, undefined],
        [querySnapshot],
    )
}
