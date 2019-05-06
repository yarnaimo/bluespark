# BlueSpark

> Firestore library for TypeScript using io-ts

## Installation

```sh
yarn add firebase bluespark
```

## Usage

```ts
import * as firebase from 'firebase'
import * as t from 'io-ts'
import { dayjs, blue, DayjsFromFirestoreTimestamp, FieldValue } from 'bluespark'

firebase.initializeApp({
    apiKey: '### FIREBASE API KEY ###',
    authDomain: '### FIREBASE AUTH DOMAIN ###',
    projectId: '### CLOUD FIRESTORE PROJECT ID ###',
})

const db = firebase.firestore()

// Schema
const Post = blue(
    'posts',
    t.type({
        id: t.number,
        date: t.union([DayjsFromFirestoreTimestamp, FieldValue]), // Dayjs or FieldValue
        text: t.string,
        tags: t.array(t.string),
    }),
)

const posts = Post.within(db) // equivalent to `db.collection('posts')`
```

### get

```ts
const post = await Post(posts.doc('doc-path')).get()

// from snapshot
const post = await posts
    .doc('doc-path')
    .get()
    .then(Post.ss)
```

### set, setMerge, update

```ts
await Post(posts.doc('doc-path')).set({
    id: 17,
    date: dayjs(),
    text: 'text',
    tags: ['a', 'b'],
})
```
