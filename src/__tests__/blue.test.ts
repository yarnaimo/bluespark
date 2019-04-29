import { FirestoreTest } from '@yarnaimo/firebase-testing'
import { t } from '@yarnaimo/rain'
import dayjs from 'dayjs'
import { firestore } from 'firebase'
import { blue } from '../blue'
import { DayjsFromFirestoreTimestamp } from '../types/DayjsFromFirestoreTimestamp'
import { FieldValue } from '../types/FieldValue'

const provider = new FirestoreTest('bluespark-test')
let db: firestore.Firestore

const path = 'doc-path'
const date = dayjs()

const doc = () => db.collection('posts').doc(path)
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
    }),
)

describe('read', () => {
    beforeEach(async () => {
        await set()
    })

    test('get', async () => {
        const post = await doc()
            .get()
            .then(Post.in)

        expect(post).toEqual({
            id: 17,
            date,
            text: 'text',
            tags: ['a', 'b'],
        })
    })
})

describe('write', () => {
    test('set', async () => {
        await Post.out(doc()).set({
            id: 17,
            date,
            text: 'text',
            tags: ['a', 'b'],
        })

        expect(await docData()).toEqual({
            id: 17,
            date: firestore.Timestamp.fromDate(date.toDate()),
            text: 'text',
            tags: ['a', 'b'],
        })
    })

    test('setMerge', async () => {
        await set()
        await Post.out(doc()).setMerge({
            text: 'new-text',
        })

        expect(await docData()).toEqual({
            id: 17,
            date: firestore.Timestamp.fromDate(date.toDate()),
            text: 'new-text',
            tags: ['a', 'b'],
        })
    })

    test('update', async () => {
        await set()
        await Post.out(doc()).update({
            text: 'new-text',
        })

        expect(await docData()).toEqual({
            id: 17,
            date: firestore.Timestamp.fromDate(date.toDate()),
            text: 'new-text',
            tags: ['a', 'b'],
        })
    })
})
