import dayjs, { Dayjs } from 'dayjs'
import { firestore } from 'firebase'
import { expectType } from 'tsd'
import { Blue, Platforms } from '../blue-types'
import { Decoder, Encoder, Leaf, Spark, SparkDoc } from '../spark'
import { _deepConvertDayjsToDate, _deepConvertTimestampToDayjs } from '../utils'
import { getProvider } from './provider'

const path = 'doc-path'
const date = dayjs()

const provider = getProvider()
const getDB = () => provider.getFirestoreWithAuth()

type IPost = {
    id: number
    date: Dayjs | Blue.FieldValue['union']
    text: string
    tags: string[]
    user: Blue.DocRef['union']
}

class PostModel<P extends Platforms> extends Spark<P, IPost, Leaf<P, IPost>> {
    path = 'posts'
    decoder: Decoder<IPost> = _deepConvertTimestampToDayjs
    encoder: Encoder<IPost> = _deepConvertDayjsToDate

    _LeafClass = Leaf
}

class UserModel<P extends Platforms> extends Spark<P, IPost, Leaf<P, IPost>> {
    path = 'users'
    decoder: Decoder<IPost> = a => a
    encoder: Encoder<IPost> = a => a

    _LeafClass = Leaf
}

const getCollections = (db: firestore.Firestore) => {
    const postC = new PostModel('web', db)
    const userC = new UserModel('web', db)
    return { postC, userC }
}
// const getDocRefs = (db: firestore.Firestore) => {
//     const postDoc = postModel.collectionIn(db).doc(path)
//     const userDoc = User.collectionIn(db).doc(path)
//     return { userDoc, postDoc }
// }

const userDocData = {
    name: 'imo',
}

describe('read', () => {
    // test('get', async () => {
    //     const db = getDB()
    //     const { userDoc, postDoc } = getDocRefs(db)
    //     await userDoc.set(userDocData)
    //     await postDoc.set({
    //         id: 17,
    //         date: date.toDate(),
    //         text: 'text',
    //         tags: ['a', 'b'],
    //         user: userDoc,
    //     })

    //     //

    //     const post = await Post.leaf(postDoc).get()

    //     expectType<{
    //         data: SparkDoc<IPost> | undefined
    //         leaf: Leaf<IPost, BlueWeb.DocumentReference>
    //         docSnapshot: BlueWeb.DocumentSnapshot
    //     }>(post)

    //     expect(post.data).toMatchObject({
    //         id: 17,
    //         date,
    //         text: 'text',
    //         tags: ['a', 'b'],
    //     })
    //     expect(post.data!.user).toBeInstanceOf(firestore.DocumentReference)
    // })

    test('get', async () => {
        const db = getDB()
        const { postC, userC } = getCollections(db)
        await userC.ref.doc(path).set(userDocData)
        await postC.ref.doc(path).set({
            id: 17,
            date: date.toDate(),
            text: 'text',
            tags: ['a', 'b'],
            user: userC.ref.doc(path),
        })

        //

        const post = await postC.leaf(path).get()

        expectType<
            | SparkDoc<IPost> & {
                  _id: string
                  _leaf: Leaf<'web', IPost>
                  _docSnapshot: Blue.DocSnapshot['web']
              }
            | undefined
        >(post)

        expect(post).toMatchObject({
            _id: path,
            _leaf: expect.any(Leaf),
            _docSnapshot: expect.any(firestore.DocumentSnapshot),
            id: 17,
            date,
            text: 'text',
            tags: ['a', 'b'],
        })
        expect(post!.user).toBeInstanceOf(firestore.DocumentReference)
    })

    test('get - querySnap', async () => {
        const db = getDB()
        const { postC, userC } = getCollections(db)
        await userC.ref.doc(path).set(userDocData)
        await postC.ref.doc(path).set({
            id: 17,
            date: date.toDate(),
            text: 'text',
            tags: ['a', 'b'],
            user: userC.ref.doc(path),
        })

        //

        const [[post], snapshot] = await postC.querySnap(c => c.limit(5))

        expectType<
            SparkDoc<IPost> & {
                _id: string
                _leaf: Leaf<'web', IPost>
                _docSnapshot: Blue.DocSnapshot['web']
            }
        >(post)

        expect(post).toMatchObject({
            _id: path,
            _leaf: expect.any(Leaf),
            _docSnapshot: expect.any(firestore.DocumentSnapshot),
            id: 17,
            date,
            text: 'text',
            tags: ['a', 'b'],
        })
        expect(post!.user).toBeInstanceOf(firestore.DocumentReference)
    })
})

describe('write', () => {
    test('create', async () => {
        const db = getDB()
        const { postC, userC } = getCollections(db)
        await postC.leaf(path).create({
            id: 17,
            date,
            text: 'text',
            tags: ['a', 'b'],
            user: userC.ref.doc(path),
        })

        //

        const docData = await postC.ref
            .doc(path)
            .get()
            .then(snap => snap.data())

        expect(docData).toMatchObject({
            _createdAt: expect.any(firestore.Timestamp),
            _updatedAt: expect.any(firestore.Timestamp),
            id: 17,
            date: firestore.Timestamp.fromDate(date.toDate()),
            text: 'text',
            tags: ['a', 'b'],
        })
        expect(docData!.user).toBeInstanceOf(firestore.DocumentReference)
    })

    test('create - serverTimestamp', async () => {
        const db = getDB()
        const { postC, userC } = getCollections(db)
        await postC.leaf(path).create({
            id: 17,
            date: firestore.FieldValue.serverTimestamp(),
            text: 'text',
            tags: ['a', 'b'],
            user: userC.ref.doc(path),
        })

        //

        const docData = await postC.ref
            .doc(path)
            .get()
            .then(snap => snap.data())

        expect(docData).toMatchObject({
            _createdAt: expect.any(firestore.Timestamp),
            _updatedAt: expect.any(firestore.Timestamp),
            id: 17,
            date: expect.any(firestore.Timestamp),
            text: 'text',
            tags: ['a', 'b'],
        })
        expect(docData!.user).toBeInstanceOf(firestore.DocumentReference)
    })

    // test('setMerge', async () => {
    //     const db = getDB()
    //     const { userDoc, postDoc } = getDocRefs(db)
    //     await postDoc.set({
    //         id: 17,
    //         date: date.toDate(),
    //         text: 'text',
    //         tags: ['a', 'b'],
    //         user: userDoc,
    //     })

    //     //

    //     await Post.ref(postDoc).setMerge({
    //         text: 'new-text',
    //     })

    //     const docData = await postDoc.get().then(snap => snap.data())
    //     expect(docData).toMatchObject({
    //         id: 17,
    //         date: firestore.Timestamp.fromDate(date.toDate()),
    //         text: 'new-text',
    //         tags: ['a', 'b'],
    //     })
    //     expect(docData!.user).toBeInstanceOf(firestore.DocumentReference)
    // })

    test('update', async () => {
        const db = getDB()
        const { postC, userC } = getCollections(db)
        await postC.ref.doc(path).set({
            id: 17,
            date: date.toDate(),
            text: 'text',
            tags: ['a', 'b'],
            user: userC.ref.doc(path),
        })

        //

        await postC.leaf(path).update({
            text: 'new-text',
        })

        const docData = await postC.ref
            .doc(path)
            .get()
            .then(snap => snap.data())

        expect(docData).toMatchObject({
            _updatedAt: expect.any(firestore.Timestamp),
            id: 17,
            date: firestore.Timestamp.fromDate(date.toDate()),
            text: 'new-text',
            tags: ['a', 'b'],
        })
        expect(docData!.user).toBeInstanceOf(firestore.DocumentReference)
    })

    test('delete', async () => {
        const db = getDB()
        const { postC, userC } = getCollections(db)
        await postC.ref.doc(path).set({
            id: 17,
            date: date.toDate(),
            text: 'text',
            tags: ['a', 'b'],
            user: userC.ref.doc(path),
        })

        //

        await postC.leaf(path).delete()

        const docData = await postC.ref
            .doc(path)
            .get()
            .then(snap => snap.data())

        expect(docData).toBeUndefined()
    })
})
