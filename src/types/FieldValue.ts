import { t } from '@yarnaimo/rain'
import { firestore } from 'firebase'

export class FieldValueType extends t.Type<firestore.FieldValue, firestore.FieldValue, t.mixed> {
    readonly _tag = 'FieldValueType' as const
    constructor() {
        super(
            'FieldValue',
            (u): u is firestore.FieldValue => u instanceof firestore.FieldValue,
            (u, c) => (this.is(u) ? t.success(u) : t.failure(u, c)),
            t.identity,
        )
    }
}

export interface FieldValueC extends FieldValueType {}

export const FieldValue: FieldValueC = new FieldValueType()
