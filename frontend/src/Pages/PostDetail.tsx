import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/api'
import { useAuth } from '../contexts/AuthContext'
import type { Post, Comment } from '../types'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Avatar,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material'
import { Heart, MessageCircle, Instagram, Twitter, Linkedin, Link as LinkIcon } from 'lucide-react'

type PostWithComments = Post & { comments?: Comment[], imageUrls?: string[], videoUrls?: string[], likes?: { userId: string }[] }

function PostDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [post, setPost] = useState<PostWithComments | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [commentText, setCommentText] = useState('')
  const [liked, setLiked] = useState(false)

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get(`/posts/${slug}`)
      const postData = res.data as PostWithComments
      setPost(postData)
      if (user?.id) {
        const hasLiked = postData.likes?.some((like) => like.userId === user.id) ?? false
        setLiked(hasLiked)
      } else {
        setLiked(false)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Makale yüklenemedi'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [slug, user?.id])

  useEffect(() => {
    if (slug) fetchPost()
  }, [slug, fetchPost])

  const handleLike = async () => {
    if (!post) return
    try {
      const res = await api.post('/posts/like', { postId: post.id })
      const likedNow = res.data?.liked ?? !liked
      setLiked(likedNow)
      setPost((prev) => {
        if (!prev) return prev
        const currentLikes = prev._count?.likes || 0
        const updatedCount = currentLikes + (likedNow ? 1 : -1)
        const filteredLikes = prev.likes?.filter((like) => like.userId !== user?.id) ?? []
        const updatedLikes = likedNow && user?.id ? [...filteredLikes, { userId: user.id }] : filteredLikes
        return {
          ...prev,
          likes: updatedLikes,
          _count: {
            likes: Math.max(updatedCount, 0),
            comments: prev._count?.comments || 0
          }
        }
      })
    } catch {
      if (!isAuthenticated) {
        navigate('/login')
      }
    }
  }

  const handleComment = async () => {
    if (!post || !commentText.trim()) return
    try {
      const res = await api.post('/posts/comment', { postId: post.id, content: commentText })
      const newComment: Comment = res.data
      setPost((prev) => prev ? {
        ...prev,
        comments: [newComment, ...(prev.comments || [])],
        _count: {
          likes: prev._count?.likes || 0,
          comments: (prev._count?.comments || 0) + 1
        }
      } : prev)
      setCommentText('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Yorum eklenemedi'
      setError(message)
    }
  }

  const handleShare = (platform: string) => {
    if (!post) return
    const url = window.location.href
    const title = post.title

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
      instagram: url
    }

    if (platform === 'instagram') {
      navigator.clipboard.writeText(url)
      alert('Link kopyalandı! Instagram\'da paylaşabilirsiniz.')
      return
    }

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
    }
  }

  if (loading) {
    return (
      <Box minHeight="60vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    )
  }

  if (!post) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Makale bulunamadı</Alert>
      </Container>
    )
  }

  return (
    <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Card sx={{ boxShadow: 'none', border: '1px solid #eeeeee' }}>
          <CardContent sx={{ p: { xs: 3, sm: 4, md: 6 } }}>
            {/* Title */}
            <Typography variant="h3" component="h1" fontWeight={700} sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' }, mb: 3, lineHeight: 1.3 }}>
              {post.title}
            </Typography>

            {/* Author & Meta */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              mb={4}
              pb={3}
              borderBottom="1px solid #eeeeee"
              onClick={() => post.author?.username && navigate(`/users/${post.author.username}`)}
              sx={{ cursor: 'pointer' }}
            >
              <Avatar src={post.author?.avatarUrl} alt={post.author?.username} sx={{ width: 48, height: 48 }} />
              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ '&:hover': { color: 'primary.main' } }}>
                  {post.author?.username}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(post.createdAt).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
              </Box>
            </Stack>

            {/* Categories */}
            {post.categories && post.categories.length > 0 && (
              <Stack direction="row" spacing={1} flexWrap="wrap" mb={4} gap={1}>
                {post.categories.map((cat) => (
                  <Chip
                    key={cat.id}
                    label={cat.name}
                    onClick={() => navigate(`/categories/${cat.slug}`)}
                    variant="outlined"
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Stack>
            )}

            {/* Images Gallery */}
            {post.imageUrls && post.imageUrls.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>
                  📸 Görseller
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap" gap={2}>
                  {post.imageUrls.map((url, idx) => (
                    <Box
                      key={idx}
                      component="img"
                      src={url}
                      alt={`Görsel ${idx + 1}`}
                      sx={{
                        maxWidth: '100%',
                        maxHeight: '400px',
                        borderRadius: '12px',
                        border: '1px solid #2a2a2a',
                        objectFit: 'cover',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'scale(1.02)',
                          boxShadow: '0 8px 32px rgba(0, 255, 136, 0.2)'
                        }
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Videos */}
            {post.videoUrls && post.videoUrls.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>
                  🎥 Videolar
                </Typography>
                <Stack direction="column" spacing={2}>
                  {post.videoUrls.map((url, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        position: 'relative',
                        width: '100%',
                        paddingBottom: '56.25%',
                        height: 0,
                        overflow: 'hidden',
                        borderRadius: '12px',
                        border: '1px solid #2a2a2a'
                      }}
                    >
                      {url.includes('youtube.com') || url.includes('youtu.be') ? (
                        <iframe
                          width="100%"
                          height="400"
                          src={url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                          title={`Video ${idx + 1}`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            borderRadius: '12px'
                          }}
                        />
                      ) : url.includes('vimeo.com') ? (
                        <iframe
                          width="100%"
                          height="400"
                          src={url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                          title={`Video ${idx + 1}`}
                          frameBorder="0"
                          allowFullScreen
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            borderRadius: '12px'
                          }}
                        />
                      ) : (
                        <video
                          width="100%"
                          height="400"
                          controls
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            borderRadius: '12px'
                          }}
                        >
                          <source src={url} type="video/mp4" />
                          Tarayıcınız video oynatmayı desteklemiyor.
                        </video>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Content */}
            <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 4, whiteSpace: 'pre-wrap', color: 'text.secondary' }}>
              {post.content}
            </Typography>

            <Divider sx={{ my: 4 }} />

            {/* Interactions */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={4}>
              <Button
                startIcon={<Heart size={18} />}
                onClick={handleLike}
                color={liked ? 'error' : 'primary'}
                sx={{
                  bgcolor: liked ? 'error.50' : 'transparent',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': { bgcolor: liked ? 'error.100' : 'grey.100' }
                }}
              >
                {post._count?.likes || 0} Beğeni
              </Button>
              <Button
                startIcon={<MessageCircle size={18} />}
                sx={{ fontWeight: 600, textTransform: 'none', color: 'text.secondary' }}
              >
                {post._count?.comments || 0} Yorum
              </Button>
            </Stack>

            {/* Share Section */}
            <Box sx={{ bgcolor: '#fafafa', p: 3, borderRadius: 1, mb: 4 }}>
              <Typography variant="body2" fontWeight={600} mb={2} color="text.secondary">
                Bu makaleyi paylaş
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Twitter size={16} />}
                  onClick={() => handleShare('twitter')}
                  sx={{ textTransform: 'none' }}
                >
                  Twitter
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Linkedin size={16} />}
                  onClick={() => handleShare('linkedin')}
                  sx={{ textTransform: 'none' }}
                >
                  LinkedIn
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Instagram size={16} />}
                  onClick={() => handleShare('instagram')}
                  sx={{ textTransform: 'none' }}
                >
                  Instagram
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleShare('whatsapp')}
                  sx={{ textTransform: 'none' }}
                >
                  WhatsApp
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<LinkIcon size={16} />}
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    alert('Link kopyalandı!')
                  }}
                  sx={{ textTransform: 'none' }}
                >
                  Link Kopyala
                </Button>
              </Stack>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Comments Section */}
            <Box>
              <Typography variant="h5" fontWeight={700} mb={3}>
                Yorumlar ({post._count?.comments || 0})
              </Typography>

              {isAuthenticated && (
                <Stack spacing={2} mb={4} sx={{ bgcolor: '#fafafa', p: 3, borderRadius: 1 }}>
                  <TextField
                    placeholder="Yorum yazın..."
                    multiline
                    minRows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                  <Button
                    variant="contained"
                    onClick={handleComment}
                    disabled={!commentText.trim()}
                    sx={{ alignSelf: 'flex-end', textTransform: 'none', fontWeight: 600 }}
                  >
                    Gönder
                  </Button>
                </Stack>
              )}

              {!isAuthenticated && (
                <Alert severity="info" sx={{ mb: 4 }}>
                  Yorum yapmak için lütfen{' '}
                  <Button size="small" color="inherit" onClick={() => navigate('/login')} sx={{ textDecoration: 'underline' }}>
                    giriş yapın
                  </Button>
                </Alert>
              )}

              <Stack spacing={3}>
                {post.comments && post.comments.length > 0 ? (
                  post.comments.map((c) => (
                    <Card key={c.id} sx={{ boxShadow: 'none', border: '1px solid #eeeeee' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Stack direction="row" spacing={2}>
                          <Avatar src={c.user?.avatarUrl} alt={c.user?.username} />
                          <Box flex={1}>
                            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {c.user?.username}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(c.createdAt).toLocaleDateString('tr-TR')}
                              </Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                              {c.content}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                    Henüz yorum yok. İlk yorum siz yapabilirsiniz!
                  </Typography>
                )}
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>    </Box>
  )
}

export default PostDetail