import LoaderSpinner from '../loader-spinner/loader-spinner'

export function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-neutral-200">
      <LoaderSpinner />
    </div>
  )
}

export default LoadingScreen
