import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'
import type { Post } from '../types'
import {
  Box,
  Container,
  Typography,
  Stack,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material'
import { Flame, Heart, MessageCircle, Eye } from 'lucide-react'

const getPrimaryMedia = (post: Post) => {
  const image = post.imageUrls && post.imageUrls.length > 0 ? post.imageUrls[0] : undefined
  const video = post.videoUrls && post.videoUrls.length > 0 ? post.videoUrls[0] : undefined
  return { image, video }
}

function Popular() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        setLoading(true)
        const res = await api.get('/posts', { params: { sort: 'popular' } })
        setPosts(res.data)
        setError(null)
      } catch (err) {
        console.error(err)
        setError('Popüler makaleler yüklenemedi')
      } finally {
        setLoading(false)
      }
    }

    fetchPopular()
  }, [])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        <Stack spacing={1.5} mb={4} alignItems="flex-start">
          <Stack direction="row" spacing={1} alignItems="center">
            <Flame size={24} color="#ff006e" />
            <Typography variant="h4" fontWeight={700}>
              Popüler Makaleler
            </Typography>
          </Stack>
          <Typography color="text.secondary" maxWidth="sm">
            En çok beğeni ve yorum alan makaleler burada listeleniyor. Toplam etkileşime göre sıralanır.
          </Typography>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {posts.length === 0 ? (
          <Alert severity="info">Henüz popüler sayılacak kadar etkileşim alan makale bulunamadı.</Alert>
        ) : (
          <Stack spacing={3}>
            {posts.map((post, index) => {
              const { image, video } = getPrimaryMedia(post)
              return (
                <Card
                  key={post.id}
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    overflow: 'hidden',
                    border: '1px solid #2a2a2a',
                    boxShadow: '0 8px 32px rgba(0, 255, 136, 0.1)',
                    '&:hover': { boxShadow: '0 12px 48px rgba(0, 255, 136, 0.2)', borderColor: '#00ff8844' },
                    transition: 'all 0.3s',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/posts/${post.slug}`)}
                >
                  <Box
                    sx={{
                      width: { xs: '100%', md: 280 },
                      height: { xs: 200, md: '100%' }
                    }}
                  >
                    {image ? (
                      <CardMedia
                        component="img"
                        src={image}
                        alt={post.title}
                        sx={{ height: '100%', width: '100%', objectFit: 'cover' }}
                      />
                    ) : video ? (
                      <CardMedia
                        component="video"
                        src={video}
                        autoPlay
                        muted
                        loop
                        playsInline
                        sx={{ height: '100%', width: '100%', objectFit: 'cover', backgroundColor: '#000' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: '100%',
                          width: '100%',
                          background: 'linear-gradient(135deg, rgba(0,255,136,0.2), rgba(0,212,255,0.2))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Typography variant="h5" fontWeight={700} color="#ffffffaa">
                          #{index + 1}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <CardContent sx={{ flex: 1, p: { xs: 3, md: 4 } }}>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <Typography variant="h6" fontWeight={700} color="primary.main">
                        #{index + 1}
                      </Typography>
                      <Typography variant="overline" color="text.secondary">
                        {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                      </Typography>
                    </Stack>

                    <Typography variant="h5" fontWeight={700} mb={1}>
                      {post.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2} sx={{ lineHeight: 1.6 }}>
                      {post.content.substring(0, 180)}...
                    </Typography>

                    {post.categories && post.categories.length > 0 && (
                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mb={2}>
                        {post.categories.slice(0, 3).map((cat) => (
                          <Chip key={cat.id} label={cat.name} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    )}

                    <Divider sx={{ my: 2 }} />

                    <Stack direction="row" spacing={3} alignItems="center" color="text.secondary">
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Heart size={16} />
                        <Typography variant="body2">{post._count?.likes ?? 0} Beğeni</Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <MessageCircle size={16} />
                        <Typography variant="body2">{post._count?.comments ?? 0} Yorum</Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Eye size={16} />
                        <Typography variant="body2">{post.viewCount} Görüntülenme</Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              )
            })}
          </Stack>
        )}
      </Container>
    </Box>
  )
}

export default Popular
