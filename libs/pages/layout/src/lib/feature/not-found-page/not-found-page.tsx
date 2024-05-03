export function NotFoundPage({ error }: { error?: unknown }) {
  const errorTyped = error as Error

  return (
    <div className="bg-white rounded-sm flex-grow items-center justify-center">
      <div className="text-center">
        <h1>{errorTyped?.name ?? '404'}</h1>
        <p>{errorTyped?.message ?? 'Not found'}</p>
      </div>
    </div>
  )
}

export default NotFoundPage
