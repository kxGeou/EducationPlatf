import { Routes, Route } from 'react-router-dom'
import Success from './components/userPage/Success.jsx';
import Home from './pages/Home.jsx'
import MyCourses from './pages/MyCourses.jsx'
import AuthPage from './pages/AuthPage.jsx'
import CoursePage from './pages/CoursePage.jsx' 
import { Toaster } from 'react-hot-toast';
import CourseLandingPage from './pages/CourseLandingPage.jsx';
import Loading from './components/systemLayouts/Loading.jsx';
import Error from './components/systemLayouts/Error.jsx';
import WrongPage from './components/systemLayouts/WrongPage.jsx';
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
        <Route path="/kurs/:id" element={<CourseLandingPage />} />
        <Route path='/loading' element={<Loading></Loading>} />
        <Route path='/error' element={<Error></Error>} />
        <Route path='/*' element={<WrongPage></WrongPage>} />
      </Routes>
    </>
    
  )
}
