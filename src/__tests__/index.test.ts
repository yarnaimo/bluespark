import dayjs from 'dayjs'
import { firestore as BlueW } from 'firebase/app'
import { expectType } from 'tsd'
import { Merge } from 'type-fest'
import { Blue } from '../blue-types'
import { Spark } from '../spark'
import { getProvider } from './provider'

const path = 'doc-path'
const date = dayjs().toDate()

const provider = getProvider()
let db: BlueW.Firestore

beforeEach(() => {
    db = provider.getFirestoreWithAuth()
})

type IPost = Blue.Interface<{
    number: number
    date: Blue.IO<Blue.Timestamp, Date | Blue.FieldValue>
    text: string
    tags: string[]
    user: Blue.DocRef
}>
type IPostDecoded = {
    _createdAt: Blue.Timestamp
    _updatedAt: Blue.Timestamp
    _id: string
    _ref: Blue.DocRef
    number: number
    date: Blue.Timestamp
    text: string
    tags: string[]
    user: Blue.DocRef
}

const Post = Spark<IPost>()

const getCollections = () => {
    const postC = db.collection('posts')
    const userC = db.collection('posts')
    return { postC, userC }
}

const userDocData = {
    name: 'imo',
}

describe('read', () => {
    beforeEach(async () => {
        const { postC, userC } = getCollections()
        await userC.doc(path).set(userDocData)
        await postC.doc(path).set({
            number: 17,
            date,
            text: 'text',
            tags: ['a', 'b'],
            user: userC.doc(path),
        })
    })

    test('get', async () => {
        const { postC, userC } = getCollections()

        // start

        const post = (await Post.getDoc(postC.doc(path)))!

        // end

        expectType<IPostDecoded>(post)

        expect(post).toMatchObject({
            _id: path,
            number: 17,
            date: BlueW.Timestamp.fromDate(date),
            text: 'text',
            tags: ['a', 'b'],
        })
        expect(post._ref).toBeInstanceOf(BlueW.DocumentReference)
        expect(post.user).toBeInstanceOf(BlueW.DocumentReference)
    })

    test('get - decodeQuerySnapshot - decoder', async () => {
        const { postC, userC } = getCollections()

        // start

        const { array, map } = await Post.getCollection(postC, data => ({
            ...data,
            number: String(data.number),
        }))

        // end

        const post = array[0]
        const postInMap = map.get(path)!

        ![post, postInMap].map(post => {
            expectType<Merge<IPostDecoded, { number: string }>>(post)

            expect(post).toMatchObject({
                _id: path,
                number: '17',
                date: BlueW.Timestamp.fromDate(date),
                text: 'text',
                tags: ['a', 'b'],
            })
            expect(post._ref).toBeInstanceOf(BlueW.DocumentReference)
            expect(post.user).toBeInstanceOf(BlueW.DocumentReference)
        })
    })

    // test('get - decodeAsMap', async () => {
    //     const db = getDB()
    //     const { postC, userC } = getCollections(db)
    //     await userC.doc(path).set(userDocData)
    //     await postC.doc(path).set({
    //         number: 17,
    //         date,
    //         text: 'text',
    //         tags: ['a', 'b'],
    //         user: userC.doc(path),
    //     })

    //     // start

    //     const querySnapshot = await postC.get()
    //     const posts = Post.decodeAsMap(querySnapshot)
    //     const post = posts.get(path)!

    //     // end

    //     expectType<IPostDecoded>(post)

    //     expect(post).toMatchObject({
    //         _id: path,
    //         number: 17,
    //         date: firestore.Timestamp.fromDate(date),
    //         text: 'text',
    //         tags: ['a', 'b'],
    //     })
    //     expect(post.user).toBeInstanceOf(firestore.DocumentReference)
    // })
})

describe('write', () => {
    test('create', async () => {
        const { postC, userC } = getCollections()

        // start

        await Post.create(postC.doc(path), {
            number: 17,
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
            _createdAt: expect.any(BlueW.Timestamp),
            _updatedAt: expect.any(BlueW.Timestamp),
            number: 17,
            date: BlueW.Timestamp.fromDate(date),
            text: 'text',
            tags: ['a', 'b'],
        })
        expect(docData!.user).toBeInstanceOf(BlueW.DocumentReference)
    })

    test('create - serverTimestamp', async () => {
        const { postC, userC } = getCollections()

        // start

        await Post.create(postC.doc(path), {
            number: 17,
            date: BlueW.FieldValue.serverTimestamp(),
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
            _createdAt: expect.any(BlueW.Timestamp),
            _updatedAt: expect.any(BlueW.Timestamp),
            number: 17,
            date: expect.any(BlueW.Timestamp),
            text: 'text',
            tags: ['a', 'b'],
        })
        expect(docData!.user).toBeInstanceOf(BlueW.DocumentReference)
    })

    test('update', async () => {
        const { postC, userC } = getCollections()
        await postC.doc(path).set({
            number: 17,
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
            _updatedAt: expect.any(BlueW.Timestamp),
            number: 17,
            date: BlueW.Timestamp.fromDate(date),
            text: 'new-text',
            tags: ['a', 'b'],
        })
        expect(docData!.user).toBeInstanceOf(BlueW.DocumentReference)
    })
})
