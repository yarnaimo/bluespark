# BlueSpark

> Firestore library for TypeScript

## Installation

```sh
yarn add firebase firebase-admin bluespark
```

## Initialization

```ts
import firebase, { firestore } from 'firebase/app'
import 'firebase/firestore'
import { Blue, Spark } from 'bluespark'

const app = firebase.initializeApp({
    apiKey: '### FIREBASE API KEY ###',
    authDomain: '### FIREBASE AUTH DOMAIN ###',
    projectId: '### CLOUD FIRESTORE PROJECT ID ###',
})

const dbInstance = app.firestore()
```

### Define collections

```ts
const createCollections = <F extends Blue.Firestore>(instance: F) => {
    type C = ReturnType<F['collection']>
    type Q = ReturnType<F['collectionGroup']>

    return {
        posts: () => instance.collection('posts') as C,
    }
}

const collection = createCollections(dbInstance)
// const collectionAdmin = createCollections(dbInstanceAdmin)
```

### Define models

```ts
type IPost = Blue.Interface<{
    number: number
    date: Blue.IO<Blue.Timestamp, Date | Blue.FieldValue>
    text: string
    tags: string[]
}>

const Post = Spark<IPost>()
```

## Usage

### Get document

```ts
const post = await Post.get(collection.posts().doc('doc-id'))

// with React Hooks
const { data: post, loading, error } = useSDoc(
    Post,
    collection.posts().doc('doc-id'),
)

// passes
expectType<{
    _createdAt: Blue.Timestamp
    _updatedAt: Blue.Timestamp
    _id: string
    _ref: Blue.DocRef
    number: number
    date: Blue.Timestamp
    text: string
    tags: string[]
}>(post!)
```

### Get collection/query

```ts
const { array, map } = await Post.getCollection(collection.posts())

// with React Hooks
const { array, map, query, loading, error } = useSCollection(
    Post,
    collection.posts(),
)

// passes
expectType<{
    _createdAt: Blue.Timestamp
    _updatedAt: Blue.Timestamp
    _id: string
    _ref: Blue.DocRef
    number: number
    date: Blue.Timestamp
    text: string
    tags: string[]
}>(array[0])

// passes
expectType<{
    _createdAt: Blue.Timestamp
    _updatedAt: Blue.Timestamp
    _id: string
    _ref: Blue.DocRef
    number: number
    date: Blue.Timestamp
    text: string
    tags: string[]
}>(map.get('doc-id')!)
```

### Create document

```ts
await Post.create(collection.posts().doc('doc-id'), {
    number: 17,
    date: firestore.FieldValue.serverTimestamp(), // Date | Blue.FieldValue
    text: 'text',
    tags: ['a', 'b'],
})
```

### Update document

```ts
await Post.update(collection.posts().doc('doc-id'), {
    text: 'new-text',
})
```
