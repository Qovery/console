import { LoaderSpinner } from '@qovery/shared/ui'

export function LoaderPlaceholder() {
  return (
    <div className="flex w-full justify-center text-center">
      <LoaderSpinner className="h-6 w-6" theme="dark" />
    </div>
  )
}
