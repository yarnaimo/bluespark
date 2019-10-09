export type UnionToIntersection<U> = (U extends any
    ? (k: U) => void
    : never) extends ((k: infer I) => void)
    ? I
    : never

export type PromiseReturnType<
    F extends (...args: any) => Promise<any>
> = F extends (...args: any) => Promise<infer T> ? T : never
