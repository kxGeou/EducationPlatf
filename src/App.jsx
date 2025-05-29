import { Routes, Route } from 'react-router-dom'
import Success from './components/Success.jsx'
import Home from './pages/Home.jsx'
import MyCourses from './components/MyCourses.jsx'
import AuthPage from './pages/AuthPage.jsx'
export default function App() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/login-register' element={<AuthPage />} />
      <Route path='/success' element={<Success />} />
      <Route path='/myCourses' element={<MyCourses></MyCourses>}></Route>
    </Routes>
  )
}
