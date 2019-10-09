import { firestore as BlueA } from 'firebase-admin'
import { firestore as BlueW } from 'firebase/app'
import { Opaque } from 'type-fest'

export namespace Blue {
    export type Meta = {
        _createdAt: Blue.Timestamp
        _updatedAt: Blue.Timestamp
        _id: string
        _ref: Blue.DocRef
    }

    export type IO<Decoded, ToEncode> = Opaque<{
        decoded: Decoded
        toEncode: ToEncode
    }>

    type IOConverted<O extends BlueObject, A extends 'decoded' | 'toEncode'> = {
        [K in keyof O]: O[K] extends Blue.IO<any, any>
            ? O[K][A]
            : O[K] extends BlueObject
            ? IOConverted<O[K], A>
            : O[K]
    }

    export type Interface<T extends BlueObject> = {
        _A: T
        _D: IOConverted<T & Meta, 'decoded'>
        _E: IOConverted<T, 'toEncode'>
    }

    // export type Decoder<I extends Blue.Interface<any>> = {
    //     (snapshot: Blue.QueryDocSnapshot): I['_D']
    //     (snapshot: Blue.DocSnapshot): I['_D'] | undefined
    // }

    export type FieldValueClass =
        | typeof BlueW.FieldValue
        | typeof BlueA.FieldValue

    export type Firestore = BlueW.Firestore | BlueA.Firestore
    export type Ref = DocRef | CollectionRef
    export type FieldValue = BlueW.FieldValue | BlueA.FieldValue
    // export type FieldValue = Opaque<_FieldValue>
    export type Date = Opaque<globalThis.Date>
    export type Timestamp = BlueW.Timestamp | BlueA.Timestamp
    export type Transaction = BlueW.Transaction | BlueA.Transaction

    export type CollectionRef =
        | BlueW.CollectionReference
        | BlueA.CollectionReference

    // export type Parent = MP<
    //     BlueW.Firestore | BlueW.DocumentReference,
    //     BlueA.Firestore | BlueA.DocumentReference
    // >
    export type Query = BlueW.Query | BlueA.Query

    export type DocRef = BlueW.DocumentReference | BlueA.DocumentReference
    export type DocSnapshot = BlueW.DocumentSnapshot | BlueA.DocumentSnapshot
    export type DocData = BlueW.DocumentData | BlueA.DocumentData

    export type QueryDocSnapshot =
        | BlueW.QueryDocumentSnapshot
        | BlueA.QueryDocumentSnapshot

    export type QuerySnapshot = (BlueW.QuerySnapshot | BlueA.QuerySnapshot) & {
        readonly docs: QueryDocSnapshot[]
    }
}

export type BlueValue =
    | string
    | number
    | boolean
    | null
    | BlueObject
    | BlueArray
    | Date
    | Blue.FieldValue
    | Blue.Timestamp
    | Blue.Ref

export interface BlueArray extends Array<BlueValue> {}

export type BlueObject = { [key: string]: BlueValue }
