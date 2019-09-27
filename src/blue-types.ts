import { firestore as BlueW } from 'firebase'
import { firestore as BlueA } from 'firebase-admin'

export namespace Blue {
    export type FieldValueClass = MP<
        typeof BlueW.FieldValue,
        typeof BlueA.FieldValue
    >
    export type Firestore = MP<BlueW.Firestore, BlueA.Firestore>
    export type FieldValue = MP<BlueW.FieldValue, BlueA.FieldValue>
    export type Timestamp = MP<BlueW.Timestamp, BlueA.Timestamp>
    export type Transaction = MP<BlueW.Transaction, BlueA.Transaction>

    export type CollectionRef = MP<
        BlueW.CollectionReference,
        BlueA.CollectionReference
    >
    // export type Parent = MP<
    //     BlueW.Firestore | BlueW.DocumentReference,
    //     BlueA.Firestore | BlueA.DocumentReference
    // >
    export type Query = MP<BlueW.Query, BlueA.Query>

    export type DocRef = MP<BlueW.DocumentReference, BlueA.DocumentReference>
    export type DocSnapshot = MP<BlueW.DocumentSnapshot, BlueA.DocumentSnapshot>
    export type DocData = MP<BlueW.DocumentData, BlueA.DocumentData>

    export type QueryDocSnapshot = MP<
        BlueW.QueryDocumentSnapshot,
        BlueA.QueryDocumentSnapshot
    >
    export type QuerySnapshot = MP<BlueW.QuerySnapshot, BlueA.QuerySnapshot>
    // export type QuerySnapshot = (PromiseReturnType<Query['get']>) & {
    //     readonly docs: QueryDocSnapshot[]
    // }

    export type WriteResult = MP<void, BlueA.WriteResult>
}

export type Platforms = 'web' | 'admin'

export type MP<Web, Admin> = {
    web: Web
    admin: Admin
    union: Web | Admin
    intersection: Web & Admin
}
