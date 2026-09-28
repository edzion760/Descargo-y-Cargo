import { Routes, Route } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import Home from './pages/Home'
import Restablecer from './pages/Restablecer'
import Effix from './pages/Effix'
import Constancia from './pages/Constancia'
import Admin from './pages/Admin'
import Viajes from './pages/Viajes'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/restablecer" element={<Restablecer />} />
        <Route path="/effix" element={<Effix />} />
        <Route path="/constancia" element={<Constancia />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/viajes" element={<Viajes />} />
      </Routes>
      <Toaster position="top-center" richColors closeButton />
    </>
  )
}
