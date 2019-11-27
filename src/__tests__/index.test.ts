import { firestore } from '@firebase/testing'
import { renderHook } from '@testing-library/react-hooks'
import dayjs from 'dayjs'
import { firestore as BlueW } from 'firebase/app'
import { expectType } from 'tsd'
import { Merge } from 'type-fest'
import { Blue } from '../blue-types'
import { useSCollection, useSDoc } from '../hooks'
import { Spark, SparkQuery } from '../spark'
import { MSpark } from '../utils'
import { getProvider } from './provider'

const id = 'id'
const path = 'users/id/posts/id'
const date = dayjs().toDate()
const date2 = dayjs()
    .add(1, 'day')
    .toDate()

const provider = getProvider()
let dbInstance: BlueW.Firestore

beforeEach(() => {
    dbInstance = provider.getFirestoreWithAuth()
})

type IUser = Blue.Interface<{ name: string }>

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
    _path: string
    _ref: Blue.DocRef
    number: number
    date: Blue.Timestamp
    text: string
    tags: string[]
    user: Blue.DocRef
}

const User = Spark<IUser>()({
    root: true,
    collection: db => db.collection('users'),
})

const Post = Spark<IPost>()({
    root: false,
    collection: user => user.collection('posts'),
})
const GPost = SparkQuery<IPost>()({
    root: true,
    query: user => user.collectionGroup('posts'),
})

const createCollections = <F extends Blue.Firestore>(db: F) => {
    return {
        users: User(db),
        _postsIn: <D extends Blue.DocRef>(userRef: D) => Post(userRef),
        gPosts: GPost(db),
    }
}

// const userDocData = {
//     name: 'imo',
// }

const getCollections = () => {
    const db = createCollections(dbInstance)
    const userRef = db.users.collectionRef.doc(id)
    const _posts = db._postsIn(userRef)
    const gPosts = db.gPosts

    return { userRef, _posts, gPosts }
}

describe('MSpark', () => {
    test('isEqual', () => {
        expect(MSpark.isEqual(undefined, undefined)).toBeTruthy()

        expect(
            MSpark.isEqual(
                {
                    _updatedAt: firestore.Timestamp.fromDate(date),
                    _id: id,
                } as Blue.Meta,
                {
                    _updatedAt: firestore.Timestamp.fromDate(date),
                    _id: id,
                } as Blue.Meta,
            ),
        ).toBeTruthy()

        expect(
            MSpark.isEqual(
                {
                    _updatedAt: firestore.Timestamp.fromDate(date),
                    _id: id,
                } as Blue.Meta,
                {
                    _updatedAt: firestore.Timestamp.fromDate(date2),
                    _id: id,
                } as Blue.Meta,
            ),
        ).toBeFalsy()

        expect(
            MSpark.isEqual(
                {
                    _updatedAt: firestore.Timestamp.fromDate(date),
                    _id: id,
                } as Blue.Meta,
                {
                    _updatedAt: firestore.Timestamp.fromDate(date),
                    _id: 'id2',
                } as Blue.Meta,
            ),
        ).toBeFalsy()

        expect(
            MSpark.isEqual(
                {
                    _updatedAt: date.toISOString(),
                    _id: id,
                } as Blue.MetaSerialized,
                {
                    _updatedAt: date.toISOString(),
                    _id: id,
                } as Blue.MetaSerialized,
            ),
        ).toBeTruthy()

        expect(
            MSpark.isEqual(
                {
                    _updatedAt: date.toISOString(),
                    _id: id,
                } as Blue.MetaSerialized,
                {
                    _updatedAt: date2.toISOString(),
                    _id: id,
                } as Blue.MetaSerialized,
            ),
        ).toBeFalsy()
    })

    test('serialize', () => {
        const serialized = MSpark.serialize({
            _createdAt: firestore.Timestamp.fromDate(date),
            _updatedAt: firestore.Timestamp.fromDate(date2),
            _id: id,
            _path: path,
            _ref: dbInstance.doc(path),
            text: 'text',
        })

        expectType<{
            _createdAt: string
            _updatedAt: string
            _id: string
            _path: string
            _ref: undefined
            text: string
        }>(serialized)

        expect(serialized).toEqual({
            _createdAt: date.toISOString(),
            _updatedAt: date2.toISOString(),
            _id: id,
            _path: path,
            _ref: undefined,
            text: 'text',
        })
    })

    test('deserialize', () => {
        const deserialized = MSpark.deserialize(
            {
                _createdAt: date.toISOString(),
                _updatedAt: date2.toISOString(),
                _id: id,
                _path: path,
                _ref: undefined,
                text: 'text',
            },
            false,
        )

        expectType<{
            _createdAt: Blue.Timestamp
            _updatedAt: Blue.Timestamp
            _id: string
            _path: string
            _ref: undefined
            text: string
        }>(deserialized)

        expect(deserialized).toEqual({
            _createdAt: firestore.Timestamp.fromDate(date),
            _updatedAt: firestore.Timestamp.fromDate(date2),
            _id: id,
            _path: path,
            _ref: undefined,
            text: 'text',
        })
    })
})

describe('read', () => {
    beforeEach(async () => {
        const { userRef, _posts } = getCollections()

        // await userRef.set(userDocData)
        await _posts.collectionRef.doc(id).set({
            number: 17,
            date,
            text: 'text',
            tags: ['a', 'b'],
            user: userRef,
        })
    })

    test('path', () => {
        const { userRef, _posts } = getCollections()

        expect(userRef.path).toBe('users/id')
        expect(_posts.collectionRef.path).toBe('users/id/posts')
    })

    test('get', async () => {
        const { userRef, _posts } = getCollections()

        // start

        const post1 = await _posts.getDoc({ doc: id })

        const { result, waitForNextUpdate } = renderHook(() =>
            useSDoc({ model: _posts, doc: id }),
        )
        await waitForNextUpdate()
        const {
            current: { data: post2 },
        } = result

        // end

        ![post1, post2].map(post => {
            expectType<IPostDecoded>(post!)

            expect(post).toMatchObject({
                _id: id,
                _path: path,
                number: 17,
                date: BlueW.Timestamp.fromDate(date),
                text: 'text',
                tags: ['a', 'b'],
            })
            expect(post!._ref).toBeInstanceOf(BlueW.DocumentReference)
            expect(post!.user).toBeInstanceOf(BlueW.DocumentReference)
        })
    })

    test('get - decodeQuerySnapshot - decoder', async () => {
        const { userRef, _posts, gPosts } = getCollections()

        const decoder = (data: IPost['_D']) => ({
            ...data,
            number: String(data.number),
        })

        for (const posts of [_posts, gPosts]) {
            // start

            const res1 = await posts.getQuery({ q: undefined, decoder })

            const { result, waitForNextUpdate } = renderHook(() =>
                useSCollection({ model: posts, q: undefined, decoder }),
            )
            await waitForNextUpdate()
            const { current: res2 } = result

            // end

            ![res1, res2].map(({ array, map }) => {
                const post = array[0]
                const postInMap = map.get(id)!

                ![post, postInMap].map(post => {
                    expectType<Merge<IPostDecoded, { number: string }>>(post)

                    expect(post).toMatchObject({
                        _id: id,
                        _path: path,
                        number: '17',
                        date: BlueW.Timestamp.fromDate(date),
                        text: 'text',
                        tags: ['a', 'b'],
                    })
                    expect(post._ref).toBeInstanceOf(BlueW.DocumentReference)
                    expect(post.user).toBeInstanceOf(BlueW.DocumentReference)
                })
            })
        }
    })
})

describe('write', () => {
    test('create', async () => {
        const { userRef, _posts } = getCollections()

        // start

        await _posts.create(id, {
            number: 17,
            date,
            text: 'text',
            tags: ['a', 'b'],
            user: userRef,
        })

        // end

        const docData = await _posts.collectionRef
            .doc(id)
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
        const { userRef, _posts } = getCollections()

        // start

        await _posts.create(id, {
            number: 17,
            date: BlueW.FieldValue.serverTimestamp(),
            text: 'text',
            tags: ['a', 'b'],
            user: userRef,
        })

        // end

        const docData = await _posts.collectionRef
            .doc(id)
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
        const { userRef, _posts } = getCollections()

        await _posts.collectionRef.doc(id).set({
            number: 17,
            date,
            text: 'text',
            tags: ['a', 'b'],
            user: userRef,
        })

        // start

        await _posts.update(id, {
            text: 'new-text',
        })

        const docData = await _posts.collectionRef
            .doc(id)
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
