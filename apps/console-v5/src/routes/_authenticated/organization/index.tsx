import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organization/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="bg-background h-full min-h-dvh w-full">
      <main className="!h-full">
        <div className="m-auto mt-6 h-full w-full max-w-7xl">
          {/* EMPTY FOR NOW */}
          {/* TODO: Add organization list or something */}
        </div>
      </main>
    </div>
  )
}
