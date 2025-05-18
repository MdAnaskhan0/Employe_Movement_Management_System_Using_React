import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SignUp from './pages/signUp'
import Login from './pages/logIn'
import Home from './pages/Home'
import UserInformation from './pages/UserInformation'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import './App.css'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/user-information" element={<UserInformation />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
