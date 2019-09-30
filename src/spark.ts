import { firestore as BlueA } from 'firebase-admin'
import { Blue } from './blue-types'
import { getFieldValueClass } from './utils'

// export type Decoded<T extends BlueObject> = DeepExclude<
//     T & Meta,
//     Blue.FieldValue | Date
// >

export const withMeta = (
    action: 'create' | 'update',
    docRef: Blue.DocRef,
    data: Blue.DocData,
) => {
    const FieldValueClass = getFieldValueClass(docRef.firestore)

    if (action === 'create') {
        return {
            _createdAt: FieldValueClass.serverTimestamp(),
            _updatedAt: FieldValueClass.serverTimestamp(),
            ...data,
        }
    } else {
        return {
            _updatedAt: FieldValueClass.serverTimestamp(),
            ...data,
        }
    }
}

export type SparkModel<I extends Blue.Interface<any>> = {
    decode: Blue.Decoder<I>
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
    const decode = (snapshot: Blue.DocSnapshot) => {
        if (!snapshot.exists) {
            return undefined as any
        }

        return {
            ...snapshot.data()!,
            _id: snapshot.id,
        }
    }

    const create = (docRef: Blue.DocRef, data: I['_E']) =>
        docRef.set(withMeta('create', docRef, data))

    const update = (docRef: Blue.DocRef, data: Partial<I['_E']>) =>
        docRef.update(withMeta('update', docRef, data))

    return {
        decode,
        create,
        update,
    }
}

// export type DecodedWithRefs<
//     P extends Platforms,
//     T extends PlainObject,
//     L extends Leaf<P, any>
// > = { _id: string; _leaf: L; _docSnapshot: Blue.DocSnapshot[P] } & Decoded<T>

// export type Decoder<T extends PlainObject> = (
//     docData: NonNullable<Blue.DocData['union']>,
// ) => Partial<Decoded<T>>

// export type Encoder<T extends PlainObject> = (
//     data: Partial<T>,
// ) => NonNullable<Blue.DocData['union']>

// // export type Snap<
// //     P extends Platforms,
// //     ST extends PlainObject,
// //     L extends Leaf<P, any>
// // > = Decoded<ST> | undefined

// // export type QuerySnap<
// //     P extends Platforms,
// //     ST extends PlainObject,
// //     L extends Leaf<P, any>
// // > = [
// //     {
// //         data: Decoded<ST>
// //         leaf: L
// //         docSnapshot: Blue.DocSnapshot[P]
// //     }[],
// //     Blue.QuerySnapshot[P],
// // ]

// export const MPModel = <
//     W extends Spark<'web', any, any>,
//     A extends Spark<'admin', any, any>
// >(
//     web: W,
//     admin: A,
// ) => {
//     return {
//         w: web,
//         a: admin,
//         as: <P extends Platforms>() => web as MP<W, A>[P],
//     }
// }

// export type QueryFn<P extends Platforms> = (
//     collectionRef: Blue.CollectionRef[P],
// ) => Blue.Query[P]

// export abstract class Spark<
//     P extends Platforms,
//     T extends PlainObject,
//     L extends Leaf<P, T>
// > {
//     abstract path: string
//     abstract decoder: Decoder<T>
//     abstract encoder: Encoder<T>
//     abstract _LeafClass: Class<L>

//     _P!: P
//     _T!: T
//     _L!: L
//     _D!: DecodedWithRefs<P, T, L>

//     // abstract leaf<DR extends Blue.DocRef>(docRef: DR): L

//     // static in<P extends Platforms>(
//     //     this: Class<Spark<P, any, any>>,
//     //     parent: Blue.Firestore[P] | Blue.DocRef[P],
//     // ) {
//     //     const collection = new this(parent)
//     //     collection
//     // }

//     // get collectionRef() {
//     //     return this.options.collectionGroup
//     //         ? (this.options.parent.collectionGroup(this.path) as Blue.Query[P])
//     //         : (this.options.parent.collection(
//     //               this.path,
//     //           ) as Blue.CollectionRef[P])
//     // }

//     get ref() {
//         return this.parent.collection(this.path) as Blue.CollectionRef[P]
//     }

//     constructor(
//         public platform: P,
//         public parent: Blue.Firestore[P] | Blue.DocRef[P],
//     ) {}

//     // collectionIn(parent: Blue.Firestore[P] | Blue.DocRef[P]) {
//     //     return parent.collection(this.path) as Blue.CollectionRef[P]
//     // }

//     // collectionGroupIn(parent: Blue.Firestore[P]) {
//     //     return parent.collectionGroup(this.path) as Blue.Query[P]
//     // }

//     get FieldValueClass() {
//         return getFieldValueClass(this.ref.firestore)
//     }

//     _encode(data: Partial<T>, action: 'create' | 'update') {
//         const timeStamps = {
//             _updatedAt: this.FieldValueClass.serverTimestamp(),
//             ...(action === 'create'
//                 ? { _createdAt: this.FieldValueClass.serverTimestamp() }
//                 : {}),
//         }

//         const encodedData = this.encoder(data)
//         return {
//             ...timeStamps,
//             ...encodedData,
//         }
//     }

//     _decode(docSnapshot?: Blue.DocSnapshot[P]): this['_D'] | undefined {
//         if (!docSnapshot) {
//             return undefined
//         }

//         const docData = docSnapshot.data()
//         if (!docData) {
//             return undefined
//         }

//         const decodedData = this.decoder(docData) as Decoded<T>
//         return {
//             ...decodedData,
//             _id: docSnapshot.id,
//             _leaf: this.leaf(docSnapshot.id),
//             _docSnapshot: docSnapshot,
//         }
//     }

//     leaf(docId?: string): L {
//         return new this._LeafClass(
//             this,
//             docId ? this.ref.doc(docId) : this.ref.doc(),
//         )
//     }

//     // async snap<ST extends T = T>(
//     //     docRef: Blue.DocRef[P],
//     // ): Promise<Snap<P, ST, L>> {
//     //     const docSnapshot = (await docRef.get()) as Blue.DocSnapshot[P]
//     //     return this._snap(docSnapshot)
//     // }

//     async querySnap<ST extends T = T>(queryFn: QueryFn<P> = c => c) {
//         const queryRef = queryFn(this.ref)
//         const querySnapshot = (await queryRef.get()) as Blue.QuerySnapshot[P]
//         return this._querySnap(querySnapshot)
//     }

//     // _snap<ST extends T = T>(docSnapshot: Blue.DocSnapshot[P]): Snap<P, ST, L> {
//     //     const data = docSnapshot.data()
//     //     const decodedData = data
//     //         ? (this.decoder(data) as Decoded<ST>)
//     //         : undefined

//     //     return {
//     //         data: decodedData,
//     //         leaf: this.leaf(docSnapshot.ref as Blue.DocRef[P]),
//     //         docSnapshot,
//     //     }
//     // }

//     _querySnap<ST extends T = T>(querySnapshot: Blue.QuerySnapshot[P]) {
//         const docs = querySnapshot.docs as Blue.QueryDocSnapshot[P][]

//         const decodedDataList = docs.map(
//             docSnapshot => this._decode(docSnapshot)!,
//         )
//         return [decodedDataList, querySnapshot] as const
//     }
// }

// export class Leaf<P extends Platforms, T extends PlainObject> {
//     get FieldValueClass() {
//         return getFieldValueClass(this.ref.firestore)
//     }

//     constructor(public model: Spark<P, T, any>, public ref: Blue.DocRef[P]) {}

//     async get<ST extends T = T>() {
//         const docSnapshot = (await this.ref.get()) as Blue.DocSnapshot[P]
//         return this.model._decode(docSnapshot)
//     }

//     // async get<ST extends T = T>() {
//     //     const snapshot = await this.ref.get()
//     //     return this.SparkClass.snap(snapshot) as Snap<
//     //         ST,
//     //         Blue.DocSnapshot
//     //     >
//     // }
//     create(data: T) {
//         return this.ref.set(this.model._encode(data, 'create')) as Promise<
//             Blue.WriteResult[P]
//         >
//     }
//     update(data: Partial<T>) {
//         return this.ref.update(this.model._encode(data, 'update')) as Promise<
//             Blue.WriteResult[P]
//         >
//     }
//     delete() {
//         return this.ref.delete() as Promise<Blue.WriteResult[P]>
//     }

//     async getTx(transaction: Blue.Transaction['union']) {
//         const snapshot = await transaction.get(this
//             .ref as Blue.DocRef['intersection'])
//         return this.model._decode(snapshot as Blue.DocSnapshot[P])
//     }
//     createTx(transaction: Blue.Transaction['union'], data: T) {
//         return transaction.set(
//             this.ref as Blue.DocRef['intersection'],
//             this.model._encode(data, 'create'),
//         ) as Blue.Transaction[P]
//     }
//     updateTx(transaction: Blue.Transaction['union'], data: Partial<T>) {
//         if (transaction instanceof firestore.Transaction) {
//             return transaction.update(
//                 this.ref as Blue.DocRef['intersection'],
//                 this.model._encode(data, 'update'),
//             ) as Blue.Transaction[P]
//         } else {
//             return transaction.update(
//                 this.ref as Blue.DocRef['intersection'],
//                 this.model._encode(data, 'update'),
//             ) as Blue.Transaction[P]
//         }
//     }
//     deleteTx(transaction: Blue.Transaction['union']) {
//         return transaction.delete(this.ref as Blue.DocRef['intersection'])
//     }
// }

// export const _Spark = <T extends PlainObject>({
//     path,
//     decoder,
//     encoder: _encoder,
// }: {
//     path: string
//     decoder: (docData: NonNullable<Blue.DocData>) => Partial<Decoded<T>>
//     encoder: (data: Partial<T>) => NonNullable<Blue.DocData>
// }) => {
//     const collectionWithin = <A extends Blue.Firestore | Blue.DocRef>(a: A) =>
//         a.collection(path) as ReturnType<A['collection']>

//     const collectionGroupWithin = <A extends Blue.Firestore>(a: A) =>
//         a.collectionGroup(path) as ReturnType<A['collectionGroup']>

//     //

//     const snap = <ST extends PlainObject = T>(
//         docSnapshot: Blue.DocSnapshot,
//     ) => {
//         const data = docSnapshot.data()
//         const decodedData = data ? (decoder(data) as Decoded<ST>) : undefined

//         return { data: decodedData, blue: ref(docSnapshot.ref), docSnapshot }
//     }

//     const querySnap = <ST extends PlainObject = T>(
//         querySnapshot: Blue.QuerySnapshot,
//     ) => {
//         const { docs } = querySnapshot
//         const decodedDataList = docs.map(docSnapshot => {
//             return {
//                 data: decoder(docSnapshot.data()) as Decoded<ST>,
//                 blue: ref(docSnapshot.ref),
//                 docSnapshot,
//             }
//         })

//         return [decodedDataList, querySnapshot] as const
//     }

//     const ref = (docRef: Blue.DocRef) => {
//         const FieldValueClass = getFieldValueClass(docRef.firestore)

//         const encode = (data: Partial<T>, action: 'create' | 'update') => {
//             const timeStamps = {
//                 _updatedAt: FieldValueClass.serverTimestamp(),
//                 ...(action === 'create'
//                     ? { _createdAt: FieldValueClass.serverTimestamp() }
//                     : {}),
//             }

//             const encodedData = _encoder(data)
//             return {
//                 ...timeStamps,
//                 ...encodedData,
//             }
//         }

//         return {
//             docRef,

//             get: async () => {
//                 const snapshot = await docRef.get()
//                 return snap(snapshot)
//             },

//             create: (data: T) => {
//                 return docRef.set(encode(data, 'create'))
//             },
//             // setMerge: (data: Partial<T>) => {
//             //     return docRef.set(encode(data, 'update'), { merge: true })
//             // },
//             update: (data: Partial<T>) => {
//                 return docRef.update(encode(data, 'update'))
//             },
//             delete: () => {
//                 return docRef.delete()
//             },

//             tx: (transaction: Blue.Transaction) => ({
//                 get: async () => {
//                     const snapshot = await transaction.get(
//                         docRef as DocRefIntersection,
//                     )
//                     return snap(snapshot)
//                 },

//                 create: (data: T) => {
//                     return transaction.set(
//                         docRef as DocRefIntersection,
//                         encode(data, 'create'),
//                     )
//                 },
//                 // setMerge: (data: Partial<T>) => {
//                 //     return transaction.set(
//                 //         docRef as DocReferenceIntersection,
//                 //         encode(data, 'update'),
//                 //         { merge: true },
//                 //     )
//                 // },
//                 update: (data: Partial<T>) => {
//                     if (transaction instanceof firestore.Transaction) {
//                         return transaction.update(
//                             docRef as DocRefIntersection,
//                             encode(data, 'update'),
//                         )
//                     } else {
//                         return transaction.update(
//                             docRef as DocRefIntersection,
//                             encode(data, 'update'),
//                         )
//                     }
//                 },
//                 delete: () => {
//                     return transaction.delete(docRef as DocRefIntersection)
//                 },
//             }),
//         }
//     }

//     return { collectionWithin, collectionGroupWithin, snap, querySnap, ref }
// }
