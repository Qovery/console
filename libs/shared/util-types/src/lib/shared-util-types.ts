/* eslint-disable @typescript-eslint/no-explicit-any */
// From https://stackoverflow.com/questions/52237190/infer-union-types-of-type-guards-in-typescript/52237897#52237897
type GenericTypeGuard = (x: any) => x is any
type UnionTypeGuard<T> = T extends (o: any) => o is infer U ? U : never

export function unionTypeGuard<T extends GenericTypeGuard>(guards: T[]): (x: any) => x is UnionTypeGuard<T> {
  return (value): value is UnionTypeGuard<T> => guards.some((guard) => guard(value))
}

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never
type IntersectionTypeGuard<T> = UnionToIntersection<UnionTypeGuard<T>>

export function intersectionTypeGuard<T extends GenericTypeGuard>(
  guards: T[]
): (x: any) => x is IntersectionTypeGuard<T> {
  return (value): value is IntersectionTypeGuard<T> => guards.every((guard) => guard(value))
}

// From https://stackoverflow.com/a/57103940
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never

export type ValueOf<T> = T[keyof T]

/* eslint-enable @typescript-eslint/no-explicit-any */
