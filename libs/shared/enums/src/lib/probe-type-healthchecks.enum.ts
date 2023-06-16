export enum ProbeTypeEnum {
  HTTP = 'HTTP',
  GRPC = 'GRPC',
  TCP = 'TCP',
  EXEC = 'EXEC',
}

export const ProbeTypeWithNoneEnum = {
  ...ProbeTypeEnum,
  NONE: 'NONE',
} as const

export type ProbeTypeWithNoneEnum = (typeof ProbeTypeWithNoneEnum)[keyof typeof ProbeTypeWithNoneEnum]
