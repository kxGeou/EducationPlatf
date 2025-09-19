import { Routes, Route } from 'react-router-dom'
import Success from './components/userPage/Success.jsx'
import Home from './pages/Home.jsx'
import MyCourses from './pages/MyCourses.jsx'
import AuthPage from './pages/AuthPage.jsx'
import CoursePage from './pages/CoursePage.jsx'
import { ToastContainer } from 'react-toastify';
import CourseLandingPage from './pages/CourseLandingPage.jsx'
import Loading from './components/systemLayouts/Loading.jsx'
import Error from './components/systemLayouts/Error.jsx'
import WrongPage from './components/systemLayouts/WrongPage.jsx'
import BlogMainPage from './pages/BlogMainPage.jsx'
import BlogPage from './pages/BlogPage.jsx'
import TestResources from './pages/TestResources.jsx'
import { useEffect, useState } from 'react'
import { useAuthStore } from './store/authStore.js'; 
import ScrollToTop from './scripts/scrollToTop.jsx'
import PasswordResetPage from './pages/PasswordResetPage.jsx'
import NewPasswordPage from './pages/NewPasswordPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import ReportPage from './pages/ReportPage.jsx'
import Regulations from './pages/Regulations.jsx'
import FormPage from './pages/FormPage.jsx'
import ExamPage from './pages/ExamPage.jsx'
export default function App() {
  const init = useAuthStore(state => state.init)
  const loading = useAuthStore(state => state.loading)
  const user = useAuthStore(state => state.user)
  const [isDark, setIsDark] = useState(() => {
    const theme = localStorage.getItem("theme");
    return theme === "dark" ? true : false;
  });

  useEffect(() => {
    init()
  }, [])

  if (loading) {
    return <Loading /> 
  }

  return (
    <>
      <ToastContainer />
      <ScrollToTop />
      <Routes>
        <Route path='/' element={<Home isDark={isDark} setIsDark={setIsDark} />} />
        <Route path='/authentication' element={<AuthPage isDark={isDark} setIsDark={setIsDark} />} />
        <Route path='/success' element={<Success />} />
        <Route path='/update-password' element={<PasswordResetPage isDark={isDark} setIsDark={setIsDark} />} />
        <Route path='/reset-password' element={<NewPasswordPage isDark={isDark} setIsDark={setIsDark} />} />
        <Route path='/user_page' element={<MyCourses  isDark={isDark} setIsDark={setIsDark}/>} />
        <Route path='/contact' element={<ContactPage  isDark={isDark} setIsDark={setIsDark}/>} />
        <Route path='/regulations' element={<Regulations  isDark={isDark} setIsDark={setIsDark}/>} />
        <Route path='/course/:id' element={<CoursePage  isDark={isDark} setIsDark={setIsDark}/>} />
        <Route path='/kurs/:id' element={<CourseLandingPage isDark={isDark} setIsDark={setIsDark}/>} />
        <Route path='/loading' element={<Loading isDark={isDark}/>} />
        <Route path='/error' element={<Error isDark={isDark} />} />
        <Route path='/blog' element={<BlogMainPage isDark={isDark} setIsDark={setIsDark} />} />
        <Route path='/blog/:id' element={<BlogPage isDark={isDark} setIsDark={setIsDark} />} />
        <Route path='/zasoby' element={<TestResources isDark={isDark} setIsDark={setIsDark}/>} />
        <Route path='/reports' element={<ReportPage isDark={isDark}></ReportPage>}></Route>
        <Route path='/formPage' element={<FormPage isDark={isDark} setIsDark={setIsDark}></FormPage>}></Route>
        <Route path='/exam' element={<ExamPage isDark={isDark} setIsDark={setIsDark}></ExamPage>}></Route>
        <Route path='/*' element={<WrongPage isDark={isDark} setIsDark={setIsDark} />} />
      </Routes>
    </>
  )
}
