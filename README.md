# BlueSpark

> Firestore library for TypeScript

## Install

```sh
yarn add firebase firebase-admin bluespark
```

## Initialize

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

### Define models

```ts
type IUser = Blue.Interface<{ name: string }>

type IPost = Blue.Interface<{
    number: number
    date: Blue.IO<Blue.Timestamp, Date | Blue.FieldValue>
    text: string
    tags: string[]
}>

// users
const User = Spark<IUser>()({
    root: true,
    collection: db => db.collection('users'),
})

// users/{user}/posts
const Post = Spark<IPost>()({
    root: false,
    collection: user => user.collection('posts'),
})
```

### Define collections

```ts
const createCollections = <F extends Blue.Firestore>(db: F) => {
    return {
        users: User(db),
        _postsIn: <D extends Blue.DocRef>(userRef: D) => Post(userRef),
    }
}

const db = createCollections(dbInstance)
const dbAdmin = createCollections(dbInstanceAdmin) // for admin
```

## Usage

### Get document/query

```ts
// get `users/userId`
const user = await db.users.getDoc({
    doc: 'userId',
})

// get `users/userId/posts` where `number` field is greater than 3
const _posts = await db._postsIn(user._ref).getQuery({
    q: q => q.where('number', '>', 3),
})

const firstPost = _posts.array[0]
const postA = _posts.map.get('postId')!

// the type of `firstPost` and `postA` is as follows:
type _ = {
    _createdAt: Blue.Timestamp
    _updatedAt: Blue.Timestamp
    _id: string
    _ref: Blue.DocRef
    number: number
    date: Blue.Timestamp
    text: string
    tags: string[]
}

// convert data
const _posts = await db._postsIn(user._ref).getQuery({
    decoder: (post: IPost['_D']) => ({
        ...post,
        number: String(post.number),
    }),
})
_posts.array[0].number // string
```

### Get document/query (with React Hooks)

```ts
const { data: user, loading, error } = useSDoc({
    model: db.users,
    doc: 'userId',
})

const _posts = await useSCollection({
    model: db._postsIn(user._ref),
    q: q => q.where('number', '>', 3),
})

const { array, map, query, loading, error } = _posts
```

### Create document

```ts
await db._postsIn(user._ref).create('postId', {
    number: 17,
    date: firestore.FieldValue.serverTimestamp(), // Date | Blue.FieldValue
    text: 'text',
    tags: ['a', 'b'],
})
```

### Update document

```ts
await db._postsIn(user._ref).update('postId', {
    text: 'new-text',
})
```
