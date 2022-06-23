export function WarningScreenMobile() {
  return (
    // <div className="fixed top-0 left-0 w-full h-full bg-element-light-darker-600 flex items-center justify-center z-50 lg:hidden">
    //   <p className="bg-element-light-lighter-500 px-3 h-10 rounded inline-flex items-center text-text-600 text-sm font-medium">
    //     Qovery console is not web responsive yet. Please use a bigger screen.
    //   </p>
    // </div>
    <div className="fixed top-0 left-0 w-full h-full z-50 bg-brand-500 flex items-center justify-center text-element-light-darker-400 lg:hidden ">
      <div className="w-[400px] bg-white rounded p-6 text-center shadow-xl">
        <div className="flex justify-center mb-4">
          <img className="w-[80px]" src="/assets/logos/logo-icon.svg" alt="Qovery logo" />
        </div>
        <p>Qovery console is not web responsive yet. Please use a bigger screen.</p>
      </div>
    </div>
  )
}

export default WarningScreenMobile
