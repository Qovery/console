import LoaderSpinner from '../loader-spinner/loader-spinner'

export function LoadingScreen() {
  return (
    <div className="bg-neutral-200 h-screen flex items-center justify-center">
      <LoaderSpinner />
    </div>
  )
}

export default LoadingScreen
