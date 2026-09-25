import { Routes, Route } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import Home from './pages/Home'
import Restablecer from './pages/Restablecer'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/restablecer" element={<Restablecer />} />
      </Routes>
      <Toaster position="top-center" richColors closeButton />
    </>
  )
}
