import { Wheat } from 'lucide-react'

export default function LoginBrand() {
  return (
    <div className="relative z-10 px-6 text-center text-[#fff5e6]">
      <div aria-hidden="true" className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full border border-[#efdab8]/50 bg-[#3a1819]/25 backdrop-blur-sm sm:size-16">
        <Wheat size={30} strokeWidth={1.25} className="text-[#efdab8]" />
      </div>
      <h1 className="font-serif text-3xl leading-tight tracking-tight sm:text-4xl lg:text-5xl">Embutidos Cáceres</h1>
      <p className="mt-2 text-sm font-medium tracking-wide text-[#f0dfc7] sm:text-base">Tu negocio, en buenas manos</p>
    </div>
  )
}
