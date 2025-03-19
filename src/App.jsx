import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Diary from './pages/Diary'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Navbar from './components/Navbar'
import Contact from './pages/Contact'
import About from './pages/About'
import { Toaster } from 'react-hot-toast'


const App = () => {
  return (
    <>
    <Router>
    <Toaster position='top-right '/>
      <Routes>
        <Route path='/' element={<Diary/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path="/contact" element={<Contact/>}/>
        <Route path='/about' element={<About/>}/>

      </Routes>
    </Router>

    </>
  )
}

export default App