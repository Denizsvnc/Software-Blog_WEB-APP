import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/api'
import type { Post } from '../types'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material'

function UserPosts() {
  const { username } = useParams()
  const navigate = useNavigate()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadPosts = async () => {
      if (!username) return
      try {
        const res = await api.get(`/posts?author=${username}`)
        setPosts(res.data)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Makaleler yüklenemedi'
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    loadPosts()
  }, [username])

  if (loading) {
    return (
      <Box minHeight="60vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box maxWidth="900px" mx="auto" p={2} bgcolor="#0a0a0a" minHeight="100vh">
      <Typography variant="h4" fontWeight={700} mb={2}>
        {username} tarafından yazılan makaleler
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {posts.length === 0 ? (
        <Alert severity="info">Bu kullanıcı henüz makale yazmamış.</Alert>
      ) : (
        <Stack spacing={2}>
          {posts.map((post) => (
            <Card key={post.id} onClick={() => navigate(`/posts/${post.slug}`)} sx={{ cursor: 'pointer', boxShadow: '0 8px 32px rgba(0, 255, 136, 0.1)', border: '1px solid #2a2a2a', '&:hover': { borderColor: '#00ff8844', boxShadow: '0 12px 40px rgba(0, 255, 136, 0.2)' }, transition: 'all 0.3s ease' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700}>{post.title}</Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  )
}

export default UserPosts
