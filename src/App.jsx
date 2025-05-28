import { Routes, Route } from 'react-router-dom'
import Success from './components/Success.jsx'
import Home from './components/Home.jsx'
import MyCourses from './components/MyCourses.jsx'

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/success' element={<Success />} />
      <Route path='/myCourses' element={<MyCourses></MyCourses>}></Route>
    </Routes>
  )
}
