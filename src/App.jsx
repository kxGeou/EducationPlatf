import { Routes, Route } from 'react-router-dom'
import Success from './components/userPage/Success.jsx';
import Home from './pages/Home.jsx'
import MyCourses from './pages/MyCourses.jsx'
import AuthPage from './pages/AuthPage.jsx'
import CoursePage from './pages/CoursePage.jsx' 
import { Toaster } from 'react-hot-toast';
export default function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/authentication' element={<AuthPage />} />
        <Route path='/success' element={<Success />} />
        <Route path='/user_page' element={<MyCourses />} />
        <Route path='/course/:id' element={<CoursePage />} />  
      </Routes>
    </>
    
  )
}
