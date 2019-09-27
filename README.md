# 𝘉𝘭𝘶𝘦𝘚𝘱𝘢𝘳𝘬

> Firestore library for TypeScript using io-ts

## Installation

```sh
yarn add firebase bluespark
```

## Usage

```ts
import firebase from 'firebase'
import { Blue, Spark } from 'bluespark'

const app = firebase.initializeApp({
    apiKey: '### FIREBASE API KEY ###',
    authDomain: '### FIREBASE AUTH DOMAIN ###',
    projectId: '### CLOUD FIRESTORE PROJECT ID ###',
})

const db = app.firestore()

// Schema

type IPost = {
    id: number
    date: Dayjs | Blue.FieldValue
    text: string
    tags: string[]
    user: Blue.DocReference
}

const Post = Spark<IPost>('posts', {
    // automatically convert `Dayjs` object to `Date` on write
    encoder: deepConvert<dayjs.Dayjs, Date>(dayjs.isDayjs, a => a.toDate()),

    // automatically convert `Timestamp` to `Dayjs` on read
    decoder: deepConvert<Blue.Timestamp, dayjs.Dayjs>(isTimestamp, a =>
        dayjs(a.toDate()),
    ),
})

// equivalent to `db.collection('posts')`
const postCl = Post.collectionWithin(db)
```

### get

```ts
const postRef = postCl.doc('doc-path')

const post = await Post.ref(postRef).get()
/* {
    id: number
    date: Dayjs
    text: string
    tags: string[]
    user: Blue.DocReference
} */

// from snapshot
const post = await postRef.get().then(Post.snap)
```

### set, setMerge, update

```ts
const postRef = postCl.doc('doc-path')

await Post.ref(postRef).set({
    id: 17,
    date: dayjs(),
    text: 'text',
    tags: ['a', 'b'],
})
```
