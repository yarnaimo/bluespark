import is from '@sindresorhus/is'
import { firestore as BlueW } from 'firebase/app'
import { Except, Merge } from 'type-fest'
import { Blue as B, Blue } from '../blue-types'
import { getFirestoreClass } from './module'
import { MTimestamp } from './timestamp'

export const getDocRef = (
    collectionRef: B.CollectionRef,
    doc: B.DocRef | string | null,
) =>
    is.null_(doc)
        ? collectionRef.doc()
        : is.string(doc)
        ? collectionRef.doc(doc)
        : doc

export const withMeta = (
    action: 'create' | 'update',
    docRef: B.DocRef,
    data: B.DocData,
) => {
    const serverTimestamp = getFirestoreClass(
        !(docRef instanceof BlueW.DocumentReference),
    ).FieldValue.serverTimestamp()

    const copied = { ...data }

    delete copied._id
    delete copied._path
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

export class MSpark {
    static isEqual(a: undefined, b: undefined): boolean
    static isEqual(a: Blue.Meta, b: Blue.Meta): boolean
    static isEqual(a: Blue.MetaSerialized, b: Blue.MetaSerialized): boolean
    static isEqual(
        a?: Blue.Meta | Blue.MetaSerialized,
        b?: Blue.Meta | Blue.MetaSerialized,
    ) {
        const sameId = a?._id === b?._id

        const upA = a?._updatedAt
        const upB = b?._updatedAt

        const sameUpdatedAt =
            is.string(upA) || is.undefined(upA)
                ? upA === upB
                : upA.isEqual(upB as Blue.Timestamp)

        return sameId && sameUpdatedAt
    }

    static serialize<T extends B.Interface<{}>['_D']>(
        toSerialize: T,
    ): Merge<T, Blue.MetaSerialized> {
        return {
            ...toSerialize,
            _createdAt: MTimestamp.serialize(toSerialize._createdAt),
            _updatedAt: MTimestamp.serialize(toSerialize._updatedAt),
            _ref: undefined,
        }
    }

    static deserialize<S extends B.MetaSerialized>(
        serialized: S,
        admin: boolean,
    ): Merge<S, Except<Blue.Meta, '_ref'>> {
        return {
            ...serialized,
            _createdAt: MTimestamp.deserialize(serialized._createdAt, admin),
            _updatedAt: MTimestamp.deserialize(serialized._updatedAt, admin),
            _ref: undefined,
        }
    }
}
