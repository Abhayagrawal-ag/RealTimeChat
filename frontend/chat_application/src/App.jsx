import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Home from './Components/Home';
import Signup from './Components/Signup';
import Signin from './Components/Signin';
import Emailverify from './Components/Emailverify'
import {Routes, Route} from 'react-router-dom';
import Chat from './Components/Chat'

function App() {

  return (
    <>
    <Routes>
       <Route path="/" element={<Home />}/>
       <Route path="signup" element={<Signup/>}/>
       <Route path="signin" element={<Signin/>}/>
       <Route path="emailverify" element={<Emailverify/>}/>
       <Route path="chat" element={<Chat/>}/>
    </Routes>

      
    </>
  )
}

export default App
