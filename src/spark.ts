import { firestore as BlueA } from 'firebase-admin'
import { firestore as BlueW } from 'firebase/app'
import 'firebase/firestore'
import { Blue } from './blue-types'

let _BlueAdmin: typeof BlueA

// try {
//     _BlueAdmin = eval('require')('firebase-admin').firestore
// } catch (error) {}
// // typeof window !== 'undefined'
// //     ? require('firebase-admin')
// //     : (global as any).__non_webpack_require__('firebase-admin')

const getBlueAdmin = () => {
    if (!_BlueAdmin) {
        _BlueAdmin = require('firebase-admin').firestore
    }
    return _BlueAdmin
}

export const withMeta = (
    action: 'create' | 'update',
    docRef: Blue.DocRef,
    data: Blue.DocData,
) => {
    const serverTimestamp =
        docRef instanceof BlueW.DocumentReference
            ? BlueW.FieldValue.serverTimestamp()
            : getBlueAdmin().FieldValue.serverTimestamp()

    delete data._id
    delete data._createdAt
    delete data._updatedAt

    if (action === 'create') {
        return {
            ...data,
            _createdAt: serverTimestamp,
            _updatedAt: serverTimestamp,
        }
    } else {
        return {
            ...data,
            _updatedAt: serverTimestamp,
        }
    }
}

export type SparkModel<I extends Blue.Interface<any>> = {
    decode: {
        <T = I['_D']>(
            snapshot: Blue.QueryDocSnapshot,
            decoder?: (data: I['_D']) => T,
        ): T

        <T = I['_D']>(
            snapshot: Blue.DocSnapshot,
            decoder?: (data: I['_D']) => T,
        ): T | undefined
    }

    decodeQuerySnapshot: <T = I['_D']>(
        querySnapshot: Blue.QuerySnapshot,
        decoder?: (data: I['_D']) => T,
    ) => { array: T[]; map: Map<string, T> }

    create: (
        docRef: Blue.DocRef,
        data: I['_E'],
    ) => Promise<void | BlueA.WriteResult>

    update: (
        docRef: Blue.DocRef,
        data: Partial<I['_E']>,
    ) => Promise<void | BlueA.WriteResult>
}

export const Spark = <I extends Blue.Interface<any>>(): SparkModel<I> => {
    const decode: SparkModel<I>['decode'] = <T = I['_D']>(
        snapshot: Blue.DocSnapshot,
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

    const decodeQuerySnapshot: SparkModel<I>['decodeQuerySnapshot'] = <
        T = I['_D']
    >(
        { docs }: Blue.QuerySnapshot,
        decoder?: (data: I['_D']) => T,
    ) => {
        const array: I['_D'][] = []
        const dataEntries: [string, I['_D']][] = []

        for (const doc of docs) {
            const decoded = decode(doc, decoder)
            array.push(decoded)
            dataEntries.push([doc.id, decoded])
        }
        const map = new Map(dataEntries)
        return { array, map }
    }

    const create = (docRef: Blue.DocRef, data: I['_E']) =>
        docRef.set(withMeta('create', docRef, data))

    const update = (docRef: Blue.DocRef, data: Partial<I['_E']>) =>
        docRef.update(withMeta('update', docRef, data))

    return {
        decode,
        decodeQuerySnapshot,
        create,
        update,
    }
}
