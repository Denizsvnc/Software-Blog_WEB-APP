import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/api'
import type { Category, Post } from '../types'
import {
  Box,
  Card,
  Container,
  Typography,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  CardContent,
  Divider
} from '@mui/material'
import { Eye, Heart, MessageCircle } from 'lucide-react'

function Categories() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories')
        setCategories(res.data)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Kategoriler alınamadı'
        setError(message)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchPosts = async () => {
      if (!slug) {
        setPosts([])
        return
      }
      try {
        setLoading(true)
        const res = await api.get(`/posts/category/${slug}`)
        setPosts(res.data)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Makaleler alınamadı'
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [slug])

  return (
    <Box sx={{ bgcolor: '#0a0a0a', minHeight: '60vh', py: 0 }}>
      {/* Header Section */}
      <Box sx={{ bgcolor: '#1a1a1a', borderBottom: '1px solid #2a2a2a', py: 6 }}>
        <Container maxWidth="lg">
          <Stack spacing={3} mb={4}>
            <Typography variant="h3" component="h1" fontWeight={700} sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
              Kategoriler
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
              İlgilendiğiniz kategorileri seçin ve makaleleri keşfedin
            </Typography>
          </Stack>

          {/* Category Filter */}
          <Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              <Chip
                label="Tümü"
                onClick={() => navigate('/categories')}
                color={!slug ? 'primary' : 'default'}
                variant={!slug ? 'filled' : 'outlined'}
                sx={{ fontWeight: 500, height: 32 }}
              />
              {categories.map((cat) => (
                <Chip
                  key={cat.id}
                  label={cat.name}
                  color={slug === cat.slug ? 'primary' : 'default'}
                  variant={slug === cat.slug ? 'filled' : 'outlined'}
                  onClick={() => navigate(`/categories/${cat.slug}`)}
                  sx={{ fontWeight: 500, height: 32 }}
                />
              ))}
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Error Alert */}
      {error && (
        <Container maxWidth="lg" sx={{ pt: 3, pb: 3 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      )}

      {/* Posts List */}
      {slug && (
        <Container maxWidth="lg" sx={{ py: 6 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : posts.length === 0 ? (
            <Alert severity="info">Bu kategoride makale bulunamadı.</Alert>
          ) : (
            <Stack spacing={3}>
              <Typography variant="h5" fontWeight={700} mb={2}>
                Kategori: <Typography component="span" sx={{ color: 'primary.main' }}>{slug}</Typography>
              </Typography>
              {posts.map((post) => (
                <Card
                  key={post.id}
                  onClick={() => navigate(`/posts/${post.slug}`)}
                  sx={{
                    boxShadow: 'none',
                    border: '1px solid #2a2a2a',
                    '&:hover': { boxShadow: '0 8px 32px rgba(0, 255, 136, 0.15)', borderColor: '#00ff8844' },
                    transition: 'all 0.3s',
                    cursor: 'pointer'
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 1, lineHeight: 1.3 }}>
                          {post.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                          {post.content.substring(0, 120)}...
                        </Typography>
                      </Box>
                      <Divider />
                      <Stack direction="row" spacing={3} sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Eye size={14} />
                          <Typography variant="caption">{post.viewCount}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Heart size={14} />
                          <Typography variant="caption">{post._count?.likes || 0}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <MessageCircle size={14} />
                          <Typography variant="caption">{post._count?.comments || 0}</Typography>
                        </Stack>
                        <Typography variant="caption" ml="auto !important">
                          {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Container>
      )}
    </Box>
  )
}

export default Categories
