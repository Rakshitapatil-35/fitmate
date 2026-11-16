import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import './MobileNav.css'

export default function MobileNav({ links }) {
  const [open, setOpen] = useState(false)
  return <div className="fm-mobile-nav"><button type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? <X size={20} /> : <Menu size={20} />}</button>{open && <nav aria-label="Mobile navigation">{links.map((link) => <Link to={link.to} key={link.to} onClick={() => setOpen(false)}>{link.label}</Link>)}</nav>}</div>
}
