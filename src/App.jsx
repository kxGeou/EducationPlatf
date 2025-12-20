import { Routes, Route } from 'react-router-dom'
import Success from './features/MyCoursesPage/components/Success.jsx'
import Home from './features/HomePage/Home.jsx';
import MyCourses from './features/MyCoursesPage/MyCourses.jsx'
import AuthPage from './features/AuthPage/AuthPage.jsx'
import CoursePage from './features/CoursePage/CoursePage.jsx'
// DEV: CourseLandingPage import - odkomentuj na development, zakomentuj na main
// import CourseLandingPage from './features/CoursePage/CourseLandingPage.jsx'
// DEV: END CourseLandingPage import
import EbookPage from './features/EbookPage/EbookPage.jsx'
import Loading from './components/systemLayouts/Loading.jsx'
import Error from './components/systemLayouts/Error.jsx'
import WrongPage from './components/systemLayouts/WrongPage.jsx'
// DEV: Blog and TestResources imports - odkomentuj na development, zakomentuj na main
// import BlogMainPage from './features/BlogPage/BlogMainPage/BlogMainPage.jsx'
// import BlogPage from './features/BlogPage/BlogPage/BlogPage.jsx'
import TestResources from './features/TestResourcesPage/TestResources.jsx'
// DEV: END Blog and TestResources imports
import { useEffect, useState } from 'react'
import { useAuthStore } from './store/authStore.js'; 
import ScrollToTop from './scripts/scrollToTop.jsx'
import PasswordResetPage from './features/AuthPage/PasswordResetPage.jsx'
import NewPasswordPage from './features/AuthPage/NewPasswordPage.jsx'
import ContactPage from './features/ContactPage/ContactPage.jsx'
import AdminPage from './features/AdminPage/AdminPage.jsx'
import Regulations from './features/AuthPage/Regulations.jsx'
import ExamPage from './features/ExamPage/ExamPage.jsx'
// DEV: Calendar import - odkomentuj na development, zakomentuj na main
import CalendarPage from './features/CalendarPage/CalendarPage.jsx'
// DEV: END Calendar import
import { ToastProvider, useToast } from './context/ToastContext.jsx'
import ToastContainer from './components/ui/ToastContainer.jsx'
import FloatingNotificationBubble from './components/ui/FloatingNotificationBubble.jsx'
function AppContent({ isDark, setIsDark }) {
  const init = useAuthStore(state => state.init)
  const loading = useAuthStore(state => state.loading)
  const user = useAuthStore(state => state.user)
  const { toasts, removeToast } = useToast()

  useEffect(() => {
    init()
  }, [])

  if (loading) {
    return <Loading /> 
  }

  return (
    <>
      <ToastContainer 
        toasts={toasts} 
        onRemove={removeToast} 
        isDark={isDark} 
      />
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
        {/* DEV: Course Landing Page route - odkomentuj na development, zakomentuj na main */}
        {/* <Route path='/kurs/:id' element={<CourseLandingPage isDark={isDark} setIsDark={setIsDark}/>} /> */}
        {/* DEV: END Course Landing Page route */}
        <Route path='/ebook/:id' element={<EbookPage isDark={isDark} setIsDark={setIsDark}/>} />
        <Route path='/loading' element={<Loading isDark={isDark}/>} />
        <Route path='/error' element={<Error isDark={isDark} />} />
        {/* DEV: Blog routes - odkomentuj na development, zakomentuj na main */}
        {/* <Route path='/blog' element={<BlogMainPage isDark={isDark} setIsDark={setIsDark} />} /> */}
        {/* <Route path='/blog/:id' element={<BlogPage isDark={isDark} setIsDark={setIsDark} />} /> */}
        {/* DEV: END Blog routes */}
        {/* DEV: TestResources route - odkomentuj na development, zakomentuj na main */}
        <Route path='/zasoby' element={<TestResources isDark={isDark} setIsDark={setIsDark}/>} />
        {/* DEV: END TestResources route */}
        <Route path='/admin' element={<AdminPage isDark={isDark} setIsDark={setIsDark}></AdminPage>}></Route>
        <Route path='/exam' element={<ExamPage isDark={isDark} setIsDark={setIsDark}></ExamPage>}></Route>
        {/* DEV: Calendar route - odkomentuj na development, zakomentuj na main */}
        <Route path='/calendar' element={<CalendarPage isDark={isDark} setIsDark={setIsDark}></CalendarPage>}></Route>
        {/* DEV: END Calendar route */}
        <Route path='/*' element={<WrongPage isDark={isDark} setIsDark={setIsDark} />} />
      </Routes>
      
      <FloatingNotificationBubble isDark={isDark} />
    </>
  )
}

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    const theme = localStorage.getItem("theme");
    return theme === "dark" ? true : false;
  });

  return (
    <ToastProvider>
      <AppContent isDark={isDark} setIsDark={setIsDark} />
    </ToastProvider>
  )
}
