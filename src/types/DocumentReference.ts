import { t } from '@yarnaimo/rain'
import { FirestoreDocumentReference } from '../firestore'

export class DocumentReferenceType extends t.Type<
    FirestoreDocumentReference,
    FirestoreDocumentReference,
    unknown
> {
    readonly _tag = 'DocumentReferenceType' as const
    constructor() {
        super(
            'DocumentReference',
            (u): u is FirestoreDocumentReference =>
                typeof u === 'object' && u !== null && 'collection' in u,
            (u, c) => (this.is(u) ? t.success(u) : t.failure(u, c)),
            t.identity,
        )
    }
}

export interface DocumentReferenceC extends DocumentReferenceType {}

export const DocumentReference: DocumentReferenceC = new DocumentReferenceType()
