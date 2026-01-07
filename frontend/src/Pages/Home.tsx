import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Stack,
  Chip,
  TextField,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material'
import { Heart, MessageCircle, Eye, ArrowRight } from 'lucide-react'
import api from '../api/api'
import type { Post, Category } from '../types'

interface FeaturedPost extends Post {
  image?: string
}

const getPrimaryMedia = (post: Post) => {
  const image = post.imageUrls && post.imageUrls.length > 0 ? post.imageUrls[0] : undefined
  const video = post.videoUrls && post.videoUrls.length > 0 ? post.videoUrls[0] : undefined
  return { image, video }
}

function Home() {
  const [posts, setPosts] = useState<FeaturedPost[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const [subscribeAlert, setSubscribeAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [postsRes, categoriesRes] = await Promise.all([
          api.get('/posts'),
          api.get('/categories')
        ])
        setPosts(postsRes.data)
        setCategories(categoriesRes.data)
        setError(null)
      } catch (err) {
        setError('Veriler yüklenemedi')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredPosts = selectedCategory
    ? posts.filter((p) => p.categories?.some((c) => c.id === selectedCategory))
    : posts

  const featuredPost = filteredPosts[0]
  const featuredMedia = featuredPost ? getPrimaryMedia(featuredPost) : { image: undefined, video: undefined }
  const latestPosts = filteredPosts.slice(1, 7)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubscribing(true)
    setSubscribeAlert(null)
    try {
      const response = await api.post('/newsletter/subscribe', { email })
      setSubscribeAlert({ type: 'success', message: response.data?.message ?? 'Abonelik işlemi tamamlandı.' })
      setEmail('')
    } catch (err) {
      console.error('Newsletter subscribe failed', err)
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setSubscribeAlert({ type: 'error', message: message ?? 'Abonelik işlemi sırasında bir hata oluştu.' })
    } finally {
      setSubscribing(false)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ bgcolor: '#0a0a0a', py: 0 }}>
      {error && (
        <Box sx={{ bgcolor: '#1a1a1a', borderBottom: '1px solid #2a2a2a' }}>
          <Container maxWidth="lg" sx={{ py: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Container>
        </Box>
      )}

      {/* Hero Section */}
      <Box sx={{ bgcolor: '#0a0a0a', borderBottom: '1px solid #2a2a2a', py: 6 }}>
        <Container maxWidth="lg">
          <Stack spacing={2} mb={4}>
            <Typography variant="h3" component="h1" fontWeight={700} sx={{ fontSize: { xs: '2rem', md: '3rem' }, background: 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Blog & Makale
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, fontWeight: 400 }}>
              Yazılım geliştirme, teknoloji ve inovasyonun en son haberlerini keşfedin
            </Typography>
          </Stack>

          {/* Kategori Filtreleri */}
          <Box>
            <Typography variant="body2" fontWeight={600} mb={1.5} color="text.secondary">
              Kategoriler
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              <Chip
                label="Tümü"
                onClick={() => setSelectedCategory(null)}
                color={selectedCategory === null ? 'primary' : 'default'}
                variant={selectedCategory === null ? 'filled' : 'outlined'}
                sx={{ fontWeight: 500, height: 32 }}
              />
              {categories.map((cat) => (
                <Chip
                  key={cat.id}
                  label={cat.name}
                  onClick={() => setSelectedCategory(cat.id)}
                  color={selectedCategory === cat.id ? 'primary' : 'default'}
                  variant={selectedCategory === cat.id ? 'filled' : 'outlined'}
                  sx={{ fontWeight: 500, height: 32 }}
                />
              ))}
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Featured Post */}
      {featuredPost && (
        <Box sx={{ bgcolor: '#1a1a1a', borderBottom: '1px solid #2a2a2a', py: 6 }}>
          <Container maxWidth="lg">
            <Card
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0, 255, 136, 0.1)',
                bgcolor: '#0a0a0a',
                border: '1px solid #2a2a2a',
                '&:hover': { boxShadow: '0 12px 48px rgba(0, 255, 136, 0.2)', borderColor: '#00ff8844' },
                transition: 'all 0.3s'
              }}
            >
              {featuredMedia.image ? (
                <CardMedia
                  component="img"
                  src={featuredMedia.image}
                  alt={featuredPost.title}
                  sx={{
                    height: { xs: 250, md: 300 },
                    objectFit: 'cover',
                    order: { xs: 2, md: 1 }
                  }}
                />
              ) : featuredMedia.video ? (
                <CardMedia
                  component="video"
                  src={featuredMedia.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  sx={{
                    height: { xs: 250, md: 300 },
                    objectFit: 'cover',
                    order: { xs: 2, md: 1 },
                    backgroundColor: '#000'
                  }}
                />
              ) : (
                <CardMedia
                  sx={{
                    backgroundColor: '#121212',
                    height: { xs: 250, md: 300 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    order: { xs: 2, md: 1 }
                  }}
                >
                  <Typography variant="h6" sx={{ color: 'white', textAlign: 'center', p: 2 }}>
                    Featured Article
                  </Typography>
                </CardMedia>
              )}
              <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', order: { xs: 1, md: 2 }, p: 4 }}>
                <Stack direction="row" spacing={1} mb={2}>
                  {featuredPost.categories?.slice(0, 1).map((cat) => (
                    <Chip key={cat.id} label={cat.name} size="small" variant="outlined" />
                  ))}
                </Stack>
                <Typography variant="h5" fontWeight={700} mb={2} sx={{ lineHeight: 1.3 }}>
                  {featuredPost.title}
                </Typography>
                <Typography color="text.secondary" mb={3} sx={{ lineHeight: 1.6 }}>
                  {featuredPost.content.substring(0, 150)}...
                </Typography>
                <Stack direction="row" spacing={3} mb={3} sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Eye size={16} />
                    <Typography variant="body2">{featuredPost.viewCount}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Heart size={16} />
                    <Typography variant="body2">{featuredPost._count?.likes || 0}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <MessageCircle size={16} />
                    <Typography variant="body2">{featuredPost._count?.comments || 0}</Typography>
                  </Stack>
                </Stack>
                <Button
                  variant="text"
                  endIcon={<ArrowRight size={18} />}
                  onClick={() => navigate(`/posts/${featuredPost.slug}`)}
                  sx={{ justifyContent: 'flex-start', pl: 0, color: 'primary.main', '&:hover': { color: 'primary.light' } }}
                >
                  Makaleyi Oku
                </Button>
              </CardContent>
            </Card>
          </Container>
        </Box>
      )}

      {/* Latest Posts Grid */}
      {latestPosts.length > 0 && (
        <Box sx={{ py: 6 }}>
          <Container maxWidth="lg">
            <Typography variant="h5" fontWeight={700} mb={4}>
              Son Makaleler
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                gap: 3
              }}
            >
              {latestPosts.map((post) => (
                <Card
                  key={post.id}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 4px 16px rgba(0, 255, 136, 0.1)',
                    border: '1px solid #2a2a2a',
                    '&:hover': { 
                      boxShadow: '0 8px 32px rgba(0, 255, 136, 0.2)',
                      transform: 'translateY(-4px)',
                      borderColor: '#00ff8844'
                    },
                    transition: 'all 0.3s',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/posts/${post.slug}`)}
                >
                  {(() => {
                    const { image, video } = getPrimaryMedia(post)
                    if (image) {
                      return (
                        <CardMedia
                          component="img"
                          src={image}
                          alt={post.title}
                          sx={{
                            height: 160,
                            objectFit: 'cover',
                            borderRadius: '16px 16px 0 0'
                          }}
                        />
                      )
                    }
                    if (video) {
                      return (
                        <CardMedia
                          component="video"
                          src={video}
                          autoPlay
                          loop
                          muted
                          playsInline
                          sx={{
                            height: 160,
                            objectFit: 'cover',
                            borderRadius: '16px 16px 0 0',
                            backgroundColor: '#000'
                          }}
                        />
                      )
                    }
                    return (
                      <CardMedia
                        sx={{
                          backgroundColor: '#121212',
                          height: 160,
                          borderRadius: '16px 16px 0 0'
                        }}
                      />
                    )
                  })()}
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Stack direction="row" spacing={1} mb={1}>
                      {post.categories?.slice(0, 1).map((cat) => (
                        <Chip key={cat.id} label={cat.name} size="small" variant="outlined" />
                      ))}
                    </Stack>
                    <Typography variant="h6" fontWeight={600} mb={1.5} sx={{ lineHeight: 1.3 }}>
                      {post.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2.5} sx={{ lineHeight: 1.5 }}>
                      {post.content.substring(0, 100)}...
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Stack direction="row" spacing={2} sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Eye size={14} />
                        <Typography variant="caption">{post.viewCount}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Heart size={14} />
                        <Typography variant="caption">{post._count?.likes || 0}</Typography>
                      </Stack>
                      <Typography variant="caption" ml="auto !important">
                        {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Container>
        </Box>
      )}

      {/* Newsletter */}
      <Box sx={{ bgcolor: '#1a1a1a', borderTop: '1px solid #2a2a2a', py: 6 }}>
        <Container maxWidth="sm">
          <Stack spacing={3} textAlign="center">
            <Box>
              <Typography variant="h5" fontWeight={700} mb={1}>
                Haberleri Takip Edin
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Haftalık güncellemeler için abone olun. Spam olmayacak!
              </Typography>
            </Box>
            {subscribeAlert && (
              <Alert severity={subscribeAlert.type} onClose={() => setSubscribeAlert(null)}>
                {subscribeAlert.message}
              </Alert>
            )}
            <form onSubmit={handleSubscribe}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField
                  fullWidth
                  placeholder="E-posta adresiniz"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#0a0a0a'
                    }
                  }}
                />
                <Button
                  variant="contained"
                  type="submit"
                  disabled={subscribing || !email}
                  sx={{ minWidth: 120 }}
                >
                  {subscribing ? 'Gönderiliyor...' : 'Abone Ol'}
                </Button>
              </Stack>
            </form>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}

export default Home