// Duck-typed on purpose: the console auth interceptor rejects with a plain `SerializedError`
// ({ message, name, code, response }) instead of the original AxiosError
export const isForbiddenError = (error: unknown): boolean =>
  (error as { response?: { status?: number } } | null | undefined)?.response?.status === 403
