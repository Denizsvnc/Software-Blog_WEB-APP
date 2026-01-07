import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical, Eye, Instagram, Twitter, Linkedin } from 'lucide-react'
import { Box, Card, CardContent, Avatar, Typography, Chip, IconButton, Stack, Skeleton, Alert } from '@mui/material'
import api from '../api/api'
import type { Post } from '../types'
import type { AxiosError } from 'axios'

function ArticlesCard() {
  const [articles, setArticles] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [likedArticles, setLikedArticles] = useState<Set<string>>(new Set())
  const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set())
  const navigate = useNavigate()
  
  useEffect(() => {
    const getAllArticles = async () => {
      try {
        setLoading(true)
        const response = await api.get('/posts')
        setArticles(response.data)
        setError(null)
      } catch (err: unknown) {
        const error = err instanceof Error ? err.message : 'Makaleler yüklenemedi'
        console.error('API Error:', err)
        setError(error)
      } finally {
        setLoading(false)
      }
    }
    getAllArticles()
  }, [])
  
  const handleLike = async (articleId: string) => {
    try {
      const res = await api.post('/posts/like', { postId: articleId })
      const likedNow = res.data?.liked ?? false
      setLikedArticles((prev) => {
        const next = new Set(prev)
        if (likedNow) next.add(articleId)
        else next.delete(articleId)
        return next
      })
      setArticles((prev) => prev.map((a) =>
        a.id === articleId
          ? { ...a, _count: { likes: (a._count?.likes || 0) + (likedNow ? 1 : -1), comments: a._count?.comments || 0 } }
          : a
      ))
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: string }>
      if (axiosErr.response?.status === 401 || axiosErr.response?.status === 403) {
        navigate('/login')
      } else {
        setError('Beğeni işlemi başarısız')
      }
    }
  }

  const handleSave = (articleId: string) => {
    setSavedArticles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(articleId)) {
        newSet.delete(articleId)
      } else {
        newSet.add(articleId)
      }
      return newSet
    })
  }

  const handleShare = async (article: Post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.content.substring(0, 100) + '...',
          url: window.location.href
        })
      } catch {
        console.log('Paylaşım iptal edildi')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link kopyalandı!')
    }
  }

  const handleSocialShare = (article: Post, platform: string) => {
    const url = `${window.location.origin}/posts/${article.slug}`
    const title = article.title
    
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
      <Box maxWidth="900px" mx="auto" p={2}>
        {[1, 2].map(i => (
          <Card key={i} sx={{ mb: 3 }}>
            <CardContent>
              <Skeleton variant="text" width="80%" height={40} />
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="60%" />
            </CardContent>
          </Card>
        ))}
      </Box>
    )
  }

  if (error) {
    return (
      <Box maxWidth="900px" mx="auto" p={2}>
        <Alert severity="error">❌ Hata: {error}</Alert>
      </Box>
    )
  }

  if (articles.length === 0) {
    return (
      <Box maxWidth="900px" mx="auto" p={2}>
        <Alert severity="info">📰 Henüz makale yok</Alert>
      </Box>
    )
  }

  return (
    <Box minHeight="100vh" bgcolor="#f5f5f5" py={4} px={2}>
      <Box maxWidth="900px" mx="auto">
        {articles.map((article) => {
          const isLiked = likedArticles.has(article.id)
          const isSaved = savedArticles.has(article.id)
          
          return (
            <Card 
              key={article.id} 
              sx={{ 
                mb: 3, 
                transition: 'all 0.3s',
                '&:hover': { 
                  boxShadow: 6,
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <CardContent>
                {/* Başlık ve Menü */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography 
                    variant="h5" 
                    fontWeight="bold" 
                    sx={{ 
                      flex: 1,
                      cursor: 'pointer',
                      '&:hover': { color: 'primary.main' }
                    }}
                    onClick={() => navigate(`/posts/${article.slug}`)}
                  >
                    {article.title}
                  </Typography>
                  <IconButton size="small">
                    <MoreVertical size={20} />
                  </IconButton>
                </Stack>

                {/* Yazar Bilgisi */}
                <Stack 
                  direction="row" 
                  alignItems="center" 
                  spacing={1.5} 
                  mb={2}
                  onClick={() => article.author?.username && navigate(`/users/${article.author.username}`)}
                  sx={{ cursor: 'pointer', '&:hover': { opacity: 0.7 } }}
                >
                  <Avatar 
                    src={article.author?.avatarUrl} 
                    alt={article.author?.username}
                    sx={{ width: 48, height: 48 }}
                  />
                  <Box>
                    <Typography variant="subtitle2" fontWeight="600" sx={{ '&:hover': { color: 'primary.main' } }}>
                      {article.author?.username}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1} color="text.secondary">
                      <Typography variant="caption">
                        {new Date(article.createdAt).toLocaleDateString('tr-TR', { 
                          day: 'numeric', 
                          month: 'long',
                          year: 'numeric'
                        })}
                      </Typography>
                      <Typography variant="caption">·</Typography>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Eye size={14} />
                        <Typography variant="caption">
                          {article.viewCount.toLocaleString()} görüntülenme
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </Stack>

                {/* İçerik */}
                <Typography variant="body1" color="text.secondary" mb={2} lineHeight={1.7}>
                  {article.content}
                </Typography>

                {/* Kategoriler */}
                {article.categories && article.categories.length > 0 && (
                  <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
                    {article.categories.map((cat) => (
                      <Chip 
                        key={cat.id}
                        label={cat.name}
                        size="small"
                        onClick={() => navigate(`/categories/${cat.slug}`)}
                        sx={{ 
                          bgcolor: 'primary.50',
                          color: 'primary.main',
                          '&:hover': { bgcolor: 'primary.100' }
                        }}
                      />
                    ))}
                  </Stack>
                )}

                {/* Etkileşim Butonları */}
                <Stack 
                  direction="row" 
                  spacing={1} 
                  pt={2} 
                  borderTop="1px solid #f0f0f0"
                  alignItems="center"
                >
                  {/* Beğen */}
                  <IconButton 
                    onClick={() => handleLike(article.id)}
                    sx={{ 
                      bgcolor: isLiked ? 'pink.50' : 'transparent',
                      color: isLiked ? 'error.main' : 'text.secondary',
                      '&:hover': { bgcolor: isLiked ? 'pink.100' : 'grey.100' }
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" px={1}>
                      <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                      <Typography variant="body2" fontWeight="500">
                        {(article._count?.likes || 0) + (isLiked ? 1 : 0)}
                      </Typography>
                    </Stack>
                  </IconButton>

                  {/* Yorum */}
                  <IconButton sx={{ color: 'text.secondary' }}>
                    <Stack direction="row" spacing={1} alignItems="center" px={1}>
                      <MessageCircle size={20} />
                      <Typography variant="body2" fontWeight="500">
                        {article._count?.comments || 0}
                      </Typography>
                    </Stack>
                  </IconButton>

                  {/* Paylaş */}
                  <IconButton 
                    onClick={() => handleShare(article)}
                    sx={{ 
                      color: 'text.secondary',
                      '&:hover': { bgcolor: 'success.50', color: 'success.main' }
                    }}
                    title="Paylaş"
                  >
                    <Share2 size={20} />
                  </IconButton>

                  {/* Sosyal Medya Paylaş */}
                  <IconButton 
                    onClick={() => handleSocialShare(article, 'twitter')}
                    sx={{ color: 'text.secondary', '&:hover': { color: '#1DA1F2' } }}
                    size="small"
                    title="Twitter'da paylaş"
                  >
                    <Twitter size={16} />
                  </IconButton>

                  <IconButton 
                    onClick={() => handleSocialShare(article, 'linkedin')}
                    sx={{ color: 'text.secondary', '&:hover': { color: '#0A66C2' } }}
                    size="small"
                    title="LinkedIn'de paylaş"
                  >
                    <Linkedin size={16} />
                  </IconButton>

                  <IconButton 
                    onClick={() => handleSocialShare(article, 'instagram')}
                    sx={{ color: 'text.secondary', '&:hover': { color: '#E4405F' } }}
                    size="small"
                    title="Instagram'da paylaş"
                  >
                    <Instagram size={16} />
                  </IconButton>

                  <IconButton 
                    onClick={() => handleSocialShare(article, 'whatsapp')}
                    sx={{ color: 'text.secondary', '&:hover': { color: '#25D366' } }}
                    size="small"
                    title="WhatsApp'ta paylaş"
                  >
                    <Share2 size={16} />
                  </IconButton>

                  {/* Kaydet */}
                  <IconButton 
                    onClick={() => handleSave(article.id)}
                    sx={{ 
                      ml: 'auto !important',
                      bgcolor: isSaved ? 'warning.50' : 'transparent',
                      color: isSaved ? 'warning.main' : 'text.secondary',
                      '&:hover': { bgcolor: isSaved ? 'warning.100' : 'grey.100' }
                    }}
                  >
                    <Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          )
        })}
      </Box>
    </Box>
  )
}

export default ArticlesCard