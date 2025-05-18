import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SignUp from './pages/Signup'
import Login from './pages/Login'
import Home from './pages/Home'
import UserInformation from './pages/UserInformation'
import MovementStatusField from './pages/MovementStatusField'
import UserReport from './pages/UserReport'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import { AuthProvider } from './context/AuthContext' 
import './App.css'
import './index.css'

export default function App() {
  return (
    <AuthProvider> {/* Provide auth state globally */}
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          {/* Add userID param for user-information */}
          <Route path="/user-information/:userID" element={<UserInformation />} />
          <Route path="/movementstatusfield/:userID" element={<MovementStatusField />} />
          <Route path="/movementreport/:userID" element={<UserReport />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  )
}
