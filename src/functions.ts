// import { PathReporter, t } from '@yarnaimo/rain'

// export const createOnCallFn = (functionBuilder: FunctionBuilder) => <
//     T1 extends t.Type<any>,
//     T2 extends t.Type<any>
// >(
//     reqType: T1,
//     resType: T2,
//     handler: (data: t.TypeOf<T1>, context: https.CallableContext) => Promise<t.TypeOf<T2>>,
// ) => {
//     const requestHandler = functionBuilder.https.onCall((data, context) => {
//         const req = reqType.decode(data)

//         if (req.isLeft()) {
//             throw new https.HttpsError('invalid-argument', PathReporter.report(req).toString())
//         }

//         return handler(req.value, context)
//     })

//     const typedHandler = Object.assign(requestHandler, {
//         reqType,
//         resType,
//     }) as typeof requestHandler & {
//         reqType: T1
//         resType: T2
//     }

//     return typedHandler
// }

// export const onCall = createOnCallFn(region('asia-northeast1'))
