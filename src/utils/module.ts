import { firestore as BlueA } from 'firebase-admin'
import { firestore as BlueW } from 'firebase/app'

let _BlueAdmin: typeof BlueA

const getBlueAdmin = () => {
    if (!_BlueAdmin) {
        _BlueAdmin = require('firebase-admin').firestore
    }

    return _BlueAdmin
}

export const getFirestoreClass = (admin: boolean) => {
    return admin ? getBlueAdmin() : BlueW
}
