import is from '@sindresorhus/is'
import { Blue, BlueObject } from './blue-types'

export const getFieldValueClass = (firestore: Blue.Firestore) => {
    return (firestore as any)._firebaseApp.firebase_.firestore
        .FieldValue as Blue.FieldValueClass
}

//

export type UnionToIntersection<U> = (U extends any
    ? (k: U) => void
    : never) extends ((k: infer I) => void)
    ? I
    : never

export type PromiseReturnType<
    F extends (...args: any) => Promise<any>
> = F extends (...args: any) => Promise<infer T> ? T : never

export type SetOptional<
    BaseType,
    Keys extends keyof BaseType = keyof BaseType
> = Pick<BaseType, Exclude<keyof BaseType, Keys>> &
    Partial<Pick<BaseType, Keys>> extends infer InferredType
    ? { [Property in keyof InferredType]: InferredType[Property] }
    : never

//

export const isTimestamp = (a: unknown): a is Blue.Timestamp => {
    return is.object(a) && 'toDate' in a && 'toMillis' in a && 'isEqual' in a
}

export const isDocReference = (a: unknown): a is Blue.DocRef => {
    return (
        is.object(a) &&
        'id' in a &&
        'firestore' in a &&
        'parent' in a &&
        'path' in a
    )
}

// export const isPlainObject = (a: unknown): a is PlainObject => {
//     return (
//         is.object(a) &&
//         a.constructor.name === 'Object' &&
//         // !isDocReference(a) &&
//         !Object.values(a).some(is.function_)
//     )
// }

// export type PlainObject = Exclude<
//     {
//         [key: string]: BlueObject
//     },
//     Function | Blue.Ref
// >

// export type DeepConvert<O extends PlainObject, From, To> = {
//     [K in keyof O]: O[K] extends From
//         ? To
//         : O[K] extends PlainObject
//         ? DeepConvert<O[K], From, To>
//         : O[K]
// }

export type BlueIOConverted<
    O extends BlueObject,
    A extends 'decoded' | 'toEncode'
> = {
    [K in keyof O]: O[K] extends Blue.IO<any, any>
        ? O[K][A]
        : O[K] extends BlueObject
        ? BlueIOConverted<O[K], A>
        : O[K]
}

// export type DeepExclude<O extends BlueObject, T> = {
//     [K in keyof O]: O[K] extends BlueObject
//         ? DeepExclude<O[K], T>
//         : O[K] extends Blue.Timestamp | Blue.Ref
//         ? O[K]
//         : Exclude<O[K], T>
// }

// export const deepConvert = <From, To>(
//     condition: (value: unknown) => value is From,
//     converter: (value: From) => To,
// ) => {
//     const _deepConvert = <T extends PlainObject>(obj: T) => {
//         const newObj = (Array.isArray(obj) ? [] : {}) as DeepConvert<
//             T,
//             From,
//             To
//         >

//         for (const [key, value] of Object.entries(obj)) {
//             newObj[key as keyof typeof obj] = condition(value)
//                 ? converter(value)
//                 : isPlainObject(value)
//                 ? _deepConvert(value)
//                 : (value as any)
//         }

//         return newObj
//     }

//     return _deepConvert
// }

// export const _deepConvertTimestampToDayjs = deepConvert<Blue.Timestamp, Dayjs>(
//     isTimestamp,
//     a => dayjs(a.toDate()),
// )

// export const _deepConvertDayjsToDate = deepConvert<Dayjs, Date>(
//     dayjs.isDayjs,
//     a => a.toDate(),
// )
