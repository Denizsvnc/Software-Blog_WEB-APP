import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/api'
import type { Category, Post } from '../types'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  OutlinedInput,
  Checkbox,
  ListItemText,
  CircularProgress,
  Chip,
  Paper
} from '@mui/material'
import { Upload, X } from 'lucide-react'

function EditPost() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [postId, setPostId] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [videoUrls, setVideoUrls] = useState<string[]>([])
  const [imageInput, setImageInput] = useState('')
  const [videoInput, setVideoInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, postRes] = await Promise.all([
          api.get('/categories'),
          api.get(`/posts/${slug}`)
        ])
        setCategories(catRes.data)
        const post: Post = postRes.data
        setPostId(post.id)
        setTitle(post.title)
        setContent(post.content)
        setSelectedCategories(post.categories?.map((c) => c.id) || [])
        setImageUrls(post.imageUrls || [])
        setVideoUrls(post.videoUrls || [])
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Veri yüklenemedi'
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    if (slug) {
      fetchData()
    }
  }, [slug])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setImageUrls([...imageUrls, res.data.url])
    } catch (err) {
      setError('Görsel yükleme başarısız')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const handleAddImageUrl = () => {
    if (imageInput.trim()) {
      setImageUrls([...imageUrls, imageInput])
      setImageInput('')
    }
  }

  const handleAddVideoUrl = () => {
    if (videoInput.trim()) {
      setVideoUrls([...videoUrls, videoInput])
      setVideoInput('')
    }
  }

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index))
  }

  const handleRemoveVideo = (index: number) => {
    setVideoUrls(videoUrls.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!title || !content) {
      setError('Başlık ve içerik zorunludur')
      return
    }

    try {
      setSaving(true)
      const res = await api.patch(`/posts/${postId}`, {
        title,
        content,
        categoryIds: selectedCategories,
        imageUrls,
        videoUrls
      })
      const updated: Post = res.data
      navigate(`/posts/${updated.slug}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Güncelleme başarısız'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="#0a0a0a">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="#0a0a0a" p={2}>
      <Card sx={{ maxWidth: 800, width: '100%', boxShadow: '0 8px 32px rgba(0, 255, 136, 0.1)', border: '1px solid #2a2a2a' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight="bold" mb={3} textAlign="center">
            Makaleyi Düzenle
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Başlık"
                fullWidth
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={saving}
              />

              <TextField
                label="İçerik"
                fullWidth
                required
                multiline
                minRows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={saving}
              />

              <FormControl fullWidth>
                <InputLabel id="category-select">Kategoriler</InputLabel>
                <Select
                  labelId="category-select"
                  multiple
                  value={selectedCategories}
                  onChange={(e) => setSelectedCategories(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                  input={<OutlinedInput label="Kategoriler" />}
                  renderValue={(selected) =>
                    categories.filter((cat) => selected.includes(cat.id)).map((cat) => cat.name).join(', ')
                  }
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      <Checkbox checked={selectedCategories.indexOf(cat.id) > -1} />
                      <ListItemText primary={cat.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Görsel Yükleme */}
              <Paper sx={{ p: 2, bgcolor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                <Typography variant="subtitle2" fontWeight={600} mb={2}>
                  📸 Görseller
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      style={{ marginBottom: '8px' }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Upload size={16} />}
                      disabled={uploading}
                      sx={{ textTransform: 'none' }}
                    >
                      {uploading ? 'Yükleniyor...' : 'Resim Yükle'}
                    </Button>
                  </Box>

                  <Stack direction="row" spacing={1}>
                    <TextField
                      size="small"
                      placeholder="Görsel URL'si"
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddImageUrl()
                          e.preventDefault()
                        }
                      }}
                      disabled={saving}
                      sx={{ flex: 1 }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleAddImageUrl}
                      disabled={saving || !imageInput.trim()}
                      sx={{ textTransform: 'none' }}
                    >
                      Ekle
                    </Button>
                  </Stack>

                  {imageUrls.length > 0 && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      {imageUrls.map((_, idx) => (
                        <Chip
                          key={idx}
                          label={`Görsel ${idx + 1}`}
                          onDelete={() => handleRemoveImage(idx)}
                          color="primary"
                          variant="outlined"
                          icon={<X size={14} />}
                        />
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Paper>

              {/* Video Yükleme */}
              <Paper sx={{ p: 2, bgcolor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                <Typography variant="subtitle2" fontWeight={600} mb={2}>
                  🎥 Videolar
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      size="small"
                      placeholder="Video URL'si"
                      value={videoInput}
                      onChange={(e) => setVideoInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddVideoUrl()
                          e.preventDefault()
                        }
                      }}
                      disabled={saving}
                      sx={{ flex: 1 }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleAddVideoUrl}
                      disabled={saving || !videoInput.trim()}
                      sx={{ textTransform: 'none' }}
                    >
                      Ekle
                    </Button>
                  </Stack>

                  {videoUrls.length > 0 && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      {videoUrls.map((_, idx) => (
                        <Chip
                          key={idx}
                          label={`Video ${idx + 1}`}
                          onDelete={() => handleRemoveVideo(idx)}
                          color="secondary"
                          variant="outlined"
                          icon={<X size={14} />}
                        />
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Paper>

              <Button type="submit" variant="contained" size="large" disabled={saving || uploading}>
                {saving ? 'Kaydediliyor...' : 'Makaleyi Güncelle'}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}

export default EditPost
