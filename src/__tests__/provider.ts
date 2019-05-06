import { FirestoreTest } from '@yarnaimo/firebase-testing'

const provider = new FirestoreTest('bluespark-test')

export const getProvider = () => {
    beforeEach(async () => {
        provider.next()
    })

    afterEach(async () => {
        await provider.cleanup()
    })

    return provider
}
