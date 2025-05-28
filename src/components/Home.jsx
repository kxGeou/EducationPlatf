import { useState } from 'react'
import AuthModal from './auth/AuthModel'
import MiniComp from './MiniComp'
import Courses from './Courses'

function App() {
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <div>
      <button
        onClick={() => setAuthOpen(true)}
        className="p-2 bg-indigo-600 text-white rounded"
      >
        Zaloguj / Zarejestruj
      </button>
      <MiniComp></MiniComp>
      <Courses></Courses>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  )
}

export default App
