import { FirestoreTest } from '@yarnaimo/firebase-testing'
import { dayjs, t } from '@yarnaimo/rain'
import { blue } from '../blue'
import { firestore } from '../firestore'
import { DayjsFromFirestoreTimestamp } from '../types/DayjsFromFirestoreTimestamp'
import { FieldValue } from '../types/FieldValue'
import { DocumentReference } from './../types/DocumentReference'

const provider = new FirestoreTest('bluespark-test')
let db: firestore.Firestore

const path = 'doc-path'
const date = dayjs()

const doc = () => db.collection('posts').doc(path)
const userDoc = () => db.collection('users').doc(path)

const docData = () =>
    doc()
        .get()
        .then(ss => ss.data())

const set = () =>
    doc().set({
        id: 17,
        date: date.toDate(),
        text: 'text',
        tags: ['a', 'b'],
        user: userDoc(),
    })

const setUser = () =>
    userDoc().set({
        name: 'imo',
    })

beforeEach(async () => {
    provider.next()
    db = provider.getFirestoreWithAuth()
})

afterEach(async () => {
    await provider.cleanup()
})

const Post = blue(
    t.type({
        id: t.number,
        date: t.union([DayjsFromFirestoreTimestamp, FieldValue]),
        text: t.string,
        tags: t.array(t.string),
        user: DocumentReference,
    }),
)

describe('read', () => {
    beforeEach(async () => {
        await setUser()
        await set()
    })

    test('get', async () => {
        const post = await Post(doc()).get()

        expect(post).toEqual({
            id: 17,
            date,
            text: 'text',
            tags: ['a', 'b'],
            user: expect.any(firestore.DocumentReference),
        })
    })

    test('get - ss', async () => {
        const post = await doc()
            .get()
            .then(Post.ss)

        expect(post).toEqual({
            id: 17,
            date,
            text: 'text',
            tags: ['a', 'b'],
            user: expect.any(firestore.DocumentReference),
        })
    })
})

describe('write', () => {
    test('set', async () => {
        await Post(doc()).set({
            id: 17,
            date,
            text: 'text',
            tags: ['a', 'b'],
            user: userDoc(),
        })

        expect(await docData()).toEqual({
            id: 17,
            date: firestore.Timestamp.fromDate(date.toDate()),
            text: 'text',
            tags: ['a', 'b'],
            user: expect.any(firestore.DocumentReference),
        })
    })

    test('set - serverTimestamp', async () => {
        await Post(doc()).set({
            id: 17,
            date: firestore.FieldValue.serverTimestamp(),
            text: 'text',
            tags: ['a', 'b'],
            user: userDoc(),
        })

        expect(await docData()).toEqual({
            id: 17,
            date: expect.any(firestore.Timestamp),
            text: 'text',
            tags: ['a', 'b'],
            user: expect.any(firestore.DocumentReference),
        })
    })

    test('setMerge', async () => {
        await set()
        await Post(doc()).setMerge({
            text: 'new-text',
        })

        expect(await docData()).toEqual({
            id: 17,
            date: firestore.Timestamp.fromDate(date.toDate()),
            text: 'new-text',
            tags: ['a', 'b'],
            user: expect.any(firestore.DocumentReference),
        })
    })

    test('update', async () => {
        await set()
        await Post(doc()).update({
            text: 'new-text',
        })

        expect(await docData()).toEqual({
            id: 17,
            date: firestore.Timestamp.fromDate(date.toDate()),
            text: 'new-text',
            tags: ['a', 'b'],
            user: expect.any(firestore.DocumentReference),
        })
    })
})
