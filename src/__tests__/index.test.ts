import dayjs from 'dayjs'
import { firestore } from 'firebase'
import { expectType } from 'tsd'
import { Blue } from '../blue-types'
import { Spark } from '../spark'
import { getProvider } from './provider'

const path = 'doc-path'
const date = dayjs().toDate()

const provider = getProvider()
const getDB = () => provider.getFirestoreWithAuth()

type IPost = Blue.Interface<{
    id: number
    date: Blue.IO<Blue.Timestamp, Date | Blue.FieldValue>
    text: string
    tags: string[]
    user: Blue.DocRef
}>
type IPostDecoded = {
    _createdAt: Blue.Timestamp
    _updatedAt: Blue.Timestamp
    _id: string
    id: number
    date: Blue.Timestamp
    text: string
    tags: string[]
    user: Blue.DocRef
}

const Post = Spark<IPost>()

// class PostModel<P extends Platforms> extends Spark<P, IPost, Leaf<P, IPost>> {
//     path = 'posts'
//     decoder: Decoder<IPost> = _deepConvertTimestampToDayjs
//     encoder: Encoder<IPost> = _deepConvertDayjsToDate

//     _LeafClass = Leaf
// }

// class UserModel<P extends Platforms> extends Spark<P, IPost, Leaf<P, IPost>> {
//     path = 'users'
//     decoder: Decoder<IPost> = a => a
//     encoder: Encoder<IPost> = a => a

//     _LeafClass = Leaf
// }

const getCollections = (db: firestore.Firestore) => {
    const postC = db.collection('posts')
    const userC = db.collection('posts')
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
        await userC.doc(path).set(userDocData)
        await postC.doc(path).set({
            id: 17,
            date,
            text: 'text',
            tags: ['a', 'b'],
            user: userC.doc(path),
        })

        // start

        const postSnapshot = await postC.doc(path).get()
        const post = Post.decode(postSnapshot)!

        // end

        expectType<IPostDecoded>(post)

        expect(post).toMatchObject({
            _id: path,
            id: 17,
            date: firestore.Timestamp.fromDate(date),
            text: 'text',
            tags: ['a', 'b'],
        })
        expect(post.user).toBeInstanceOf(firestore.DocumentReference)
    })

    test('get - query', async () => {
        const db = getDB()
        const { postC, userC } = getCollections(db)
        await userC.doc(path).set(userDocData)
        await postC.doc(path).set({
            id: 17,
            date,
            text: 'text',
            tags: ['a', 'b'],
            user: userC.doc(path),
        })

        // start

        const { docs } = await postC.get()
        const [post] = docs.map(doc => Post.decode(doc))

        // end

        expectType<IPostDecoded>(post)

        expect(post).toMatchObject({
            _id: path,
            id: 17,
            date: firestore.Timestamp.fromDate(date),
            text: 'text',
            tags: ['a', 'b'],
        })
        expect(post.user).toBeInstanceOf(firestore.DocumentReference)
    })
})

describe('write', () => {
    test('create', async () => {
        const db = getDB()
        const { postC, userC } = getCollections(db)

        // start

        await Post.create(postC.doc(path), {
            id: 17,
            date,
            text: 'text',
            tags: ['a', 'b'],
            user: userC.doc(path),
        })

        // end

        const docData = await postC
            .doc(path)
            .get()
            .then(snap => snap.data())

        expect(docData).toMatchObject({
            _createdAt: expect.any(firestore.Timestamp),
            _updatedAt: expect.any(firestore.Timestamp),
            id: 17,
            date: firestore.Timestamp.fromDate(date),
            text: 'text',
            tags: ['a', 'b'],
        })
        expect(docData!.user).toBeInstanceOf(firestore.DocumentReference)
    })

    test('create - serverTimestamp', async () => {
        const db = getDB()
        const { postC, userC } = getCollections(db)

        // start

        await Post.create(postC.doc(path), {
            id: 17,
            date: firestore.FieldValue.serverTimestamp(),
            text: 'text',
            tags: ['a', 'b'],
            user: userC.doc(path),
        })

        // end

        const docData = await postC
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
        await postC.doc(path).set({
            id: 17,
            date,
            text: 'text',
            tags: ['a', 'b'],
            user: userC.doc(path),
        })

        // start

        await Post.update(postC.doc(path), {
            text: 'new-text',
        })

        const docData = await postC
            .doc(path)
            .get()
            .then(snap => snap.data())

        // end

        expect(docData).toMatchObject({
            _updatedAt: expect.any(firestore.Timestamp),
            id: 17,
            date: firestore.Timestamp.fromDate(date),
            text: 'new-text',
            tags: ['a', 'b'],
        })
        expect(docData!.user).toBeInstanceOf(firestore.DocumentReference)
    })

    // test('delete', async () => {
    //     const db = getDB()
    //     const { postC, userC } = getCollections(db)
    //     await postC.ref.doc(path).set({
    //         id: 17,
    //         date: date.toDate(),
    //         text: 'text',
    //         tags: ['a', 'b'],
    //         user: userC.ref.doc(path),
    //     })

    //     //

    //     await postC.leaf(path).delete()

    //     const docData = await postC.ref
    //         .doc(path)
    //         .get()
    //         .then(snap => snap.data())

    //     expect(docData).toBeUndefined()
    // })
})
