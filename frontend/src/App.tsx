import './App.css'
import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Box } from '@mui/material'
import Header from './Components/Header.tsx'
import Footer from './Components/Footer.tsx'
import Home from './Pages/Home.tsx'
import Login from './Pages/Login.tsx'
import Register from './Pages/Register.tsx'
import ProtectedRoute from './components/ProtectedRoute'
import CreatePost from './Pages/CreatePost.tsx'
import EditPost from './Pages/EditPost.tsx'
import MyPosts from './Pages/MyPosts.tsx'
import PostDetail from './Pages/PostDetail.tsx'
import Categories from './Pages/Categories.tsx'
import Profile from './Pages/Profile.tsx'
import UserProfile from './Pages/UserProfile.tsx'
import UserPosts from './Pages/UserPosts.tsx'
import Popular from './Pages/Popular.tsx'
import ScrollNavButtons from './Components/ScrollNavButtons.tsx'
import AdminDashboard from './Pages/AdminDashboard.tsx'

function App() {
  return (
    <AuthProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#0a0a0a' }}>
        <Header />
        <Box sx={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/posts/new" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
            <Route path="/posts/:slug/edit" element={<ProtectedRoute><EditPost /></ProtectedRoute>} />
            <Route path="/me/posts" element={<ProtectedRoute><MyPosts /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />

            <Route path="/posts/:slug" element={<PostDetail />} />
            <Route path="/popular" element={<Popular />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:slug" element={<Categories />} />
            <Route path="/users/:username" element={<UserProfile />} />
            <Route path="/users/:username/posts" element={<UserPosts />} />
          </Routes>
          <ScrollNavButtons />
        </Box>
        <Footer />
      </Box>
    </AuthProvider>
  )
}

export default App
