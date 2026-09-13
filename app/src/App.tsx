import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Restablecer from './pages/Restablecer'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/restablecer" element={<Restablecer />} />
    </Routes>
  )
}
