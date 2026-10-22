import { useState } from 'react'
import { Package } from 'lucide-react'
import { isSafeImageUrl } from '../../utils/productRules.js'

function ImagePreview({ src, name, className }) {
  const [failed, setFailed] = useState(false)
  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f0e6d8] text-[#a7816d] ${className}`}>
      {src && !failed ? <img src={src} alt={name} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} className="size-full object-cover" /> : <Package size={30} strokeWidth={1.4} aria-hidden="true" />}
    </div>
  )
}

export default function ProductImage({ imageUrl, name = '', className = 'size-20' }) {
  const src = isSafeImageUrl(imageUrl) ? imageUrl : ''
  return <ImagePreview key={src} src={src} name={name} className={className} />
}
