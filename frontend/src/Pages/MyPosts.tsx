import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'
import type { Post } from '../types'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material'
import { Edit, Trash2, Plus } from 'lucide-react'

function MyPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const res = await api.get('/posts/mine')
      setPosts(res.data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Makaleler alınamadı'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu makaleyi silmek istediğinize emin misiniz?')) return
    try {
      await api.delete(`/posts/${id}`)
      setPosts((prev) => prev.filter((p) => p.id !== id))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Silme başarısız'
      setError(message)
    }
  }

  if (loading) {
    return (
      <Box minHeight="60vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ bgcolor: '#0a0a0a', minHeight: '60vh', py: 0 }}>
      {/* Header */}
      <Box sx={{ bgcolor: '#1a1a1a', borderBottom: '1px solid #2a2a2a', py: 4 }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
            <Box>
              <Typography variant="h4" component="h1" fontWeight={700} sx={{ fontSize: { xs: '1.75rem', md: '2rem' } }}>
                Makalelerim
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                {posts.length} makale yayınlandı
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => navigate('/posts/new')}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Yeni Makale
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {posts.length === 0 ? (
          <Alert severity="info">Henüz makaleniz yok. Yeni bir makale yayınlamaya başlayın!</Alert>
        ) : (
          <Stack spacing={2}>
            {posts.map((post) => (
              <Card
                key={post.id}
                sx={{
                  boxShadow: 'none',
                  border: '1px solid #2a2a2a',
                  '&:hover': { boxShadow: '0 8px 32px rgba(0, 255, 136, 0.15)', borderColor: '#00ff8844' },
                  transition: 'all 0.3s'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                      <Box flex={1}>
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          sx={{
                            cursor: 'pointer',
                            '&:hover': { color: 'primary.main' },
                            mb: 1
                          }}
                          onClick={() => navigate(`/posts/${post.slug}`)}
                        >
                          {post.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(post.createdAt).toLocaleDateString('tr-TR', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          color="primary"
                          onClick={() => navigate(`/posts/${post.slug}/edit`)}
                          sx={{ '&:hover': { bgcolor: 'primary.50' } }}
                          title="Düzenle"
                        >
                          <Edit size={18} />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(post.id)}
                          sx={{ '&:hover': { bgcolor: 'error.50' } }}
                          title="Sil"
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </Stack>
                    </Stack>

                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {post.content.substring(0, 150)}...
                    </Typography>

                    <Divider />

                    <Stack direction="row" spacing={3} alignItems="center">
                      {post.categories && post.categories.length > 0 && (
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {post.categories.map((cat) => (
                            <Chip key={cat.id} label={cat.name} size="small" variant="outlined" />
                          ))}
                        </Stack>
                      )}
                      <Stack direction="row" spacing={2} ml="auto !important" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                        <Typography variant="caption">{post._count?.likes ?? 0} beğeni</Typography>
                        <Typography variant="caption">{post._count?.comments ?? 0} yorum</Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Container>    </Box>
  )
}

export default MyPosts