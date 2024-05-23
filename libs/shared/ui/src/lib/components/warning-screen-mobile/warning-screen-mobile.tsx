export function WarningScreenMobile() {
  return (
    <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-brand-500 text-neutral-650 lg:hidden ">
      <div className="w-[400px] rounded bg-white p-6 text-center shadow-xl">
        <div className="mb-4 flex justify-center">
          <img className="w-[80px]" src="/assets/logos/logo-icon.svg" alt="Qovery logo" />
        </div>
        <p>Qovery console is not web responsive yet. Please use a bigger screen.</p>
      </div>
    </div>
  )
}

export default WarningScreenMobile
