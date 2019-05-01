import { PathReporter, t } from '@yarnaimo/rain'
import { https, region } from 'firebase-functions'

export const onCall = <T1 extends t.TypeC<any>, T2 extends t.TypeC<any>>(
    reqType: T1,
    resType: T2,
    handler: (data: t.TypeOf<T1>, context: https.CallableContext) => Promise<t.TypeOf<T2>>,
) => {
    const requestHandler = region('asia-northeast1').https.onCall((data, context) => {
        const req = reqType.decode(data)

        if (req.isLeft()) {
            throw new https.HttpsError('invalid-argument', PathReporter.report(req).toString())
        }

        return handler(req.value, context)
    })

    const typedHandler = Object.assign(requestHandler, {
        reqType,
        resType,
    }) as typeof requestHandler & {
        reqType: T1
        resType: T2
    }

    return typedHandler
}
