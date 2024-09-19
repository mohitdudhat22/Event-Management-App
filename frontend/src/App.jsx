import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './Login'
import Registration from './Registration'
import Event from './Event'
import Layout from './Layout'

function App() {

  return (
    <>
      <BrowserRouter>
      <Layout>
      <Routes  path="/">
        <Route index element={<Login />} />
        <Route path="register" element={<Registration />} />
        <Route path="dashboard" element={<Event />} />

      </Routes>
      </Layout>
      </BrowserRouter>
    </>
  )
}

export default App
