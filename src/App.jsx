import { Routes, Route } from 'react-router-dom'
import Success from './components/userPage/Success.jsx'
import Home from './pages/Home.jsx'
import MyCourses from './pages/MyCourses.jsx'
import AuthPage from './pages/AuthPage.jsx'
import CoursePage from './pages/CoursePage.jsx'
import { Toaster } from 'react-hot-toast'
import CourseLandingPage from './pages/CourseLandingPage.jsx'
import Loading from './components/systemLayouts/Loading.jsx'
import Error from './components/systemLayouts/Error.jsx'
import WrongPage from './components/systemLayouts/WrongPage.jsx'
import BlogMainPage from './pages/BlogMainPage.jsx'
import TestResources from './pages/TestResources.jsx'
import { useEffect, useState } from 'react'
import { useAuthStore } from './store/authStore.js'; 
import ScrollToTop from './scripts/scrollToTop.jsx'

export default function App() {
  const init = useAuthStore(state => state.init)
  const loading = useAuthStore(state => state.loading)
  const user = useAuthStore(state => state.user)
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    init()
  }, [init])

  if (loading) {
    return <Loading /> 
  }

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <ScrollToTop></ScrollToTop>
      <Routes>
        <Route path='/' element={<Home isDark={isDark} setIsDark={setIsDark} />} />
        <Route path='/authentication' element={<AuthPage />} />
        <Route path='/success' element={<Success />} />
        <Route path='/user_page' element={<MyCourses  isDark={isDark} setIsDark={setIsDark}/>} />
        <Route path='/course/:id' element={<CoursePage />} />
        <Route path='/kurs/:id' element={<CourseLandingPage isDark={isDark} setIsDark={setIsDark}/>} />
        <Route path='/loading' element={<Loading isDark={isDark}/>} />
        <Route path='/error' element={<Error isDark={isDark} />} />
        <Route path='/blog' element={<BlogMainPage isDark={isDark} setIsDark={setIsDark} />} />
        <Route path='/zasoby' element={<TestResources isDark={isDark} setIsDark={setIsDark}/>} />
        <Route path='/*' element={<WrongPage isDark={isDark} />} />
      </Routes>
    </>
  )
}
