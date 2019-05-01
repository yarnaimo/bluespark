import { t } from '@yarnaimo/rain'
import { FirestoreFieldValue } from '../firestore'

export class FieldValueType extends t.Type<FirestoreFieldValue, FirestoreFieldValue, unknown> {
    readonly _tag = 'FieldValueType' as const
    constructor() {
        super(
            'FieldValue',
            (u): u is FirestoreFieldValue => typeof u === 'object' && u !== null && 'isEqual' in u,
            (u, c) => (this.is(u) ? t.success(u) : t.failure(u, c)),
            t.identity,
        )
    }
}

export interface FieldValueC extends FieldValueType {}

export const FieldValue: FieldValueC = new FieldValueType()
