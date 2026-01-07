import { useEffect, useState } from 'react'
import api from '../api/api'
import { useAuth } from '../contexts/AuthContext'
import type { User } from '../types'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Avatar,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material'
import { Upload } from 'lucide-react'

interface ProfileResponse extends User {
  _count?: {
    posts: number
    comments: number
    likes: number
  }
}

function Profile() {
  const { updateUser } = useAuth()
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get('/users/me')
        const data: ProfileResponse = res.data
        setProfile(data)
        setName(data.name || '')
        setEmail(data.email)
        setUsername(data.username)
        setBio(data.bio || '')
        setAvatarUrl(data.avatarUrl || '')
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Profil yüklenemedi'
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('image', file)
      const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      const url = res.data.url
      setAvatarUrl(url)
      setSuccess('Avatar yüklendi')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload başarısız'
      setError(message)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      setSaving(true)
      const res = await api.put('/users/me', { name, email, username, bio, avatarUrl })
      const updated: User = res.data
      setProfile((prev) => prev ? { ...prev, ...updated } : updated)
      updateUser(updated)
      setSuccess('Profil güncellendi')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Güncelleme başarısız'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box minHeight="60vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    )
  }

  if (!profile) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Profil bulunamadı</Alert>
      </Container>
    )
  }

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ bgcolor: '#1a1a1a', borderBottom: '1px solid #2a2a2a', py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h1" fontWeight={700} sx={{ fontSize: { xs: '1.75rem', md: '2rem' } }}>
            Profil Ayarları
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Hesap bilgilerinizi yönetin ve düzenleyin
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={4}>
          {/* Avatar & Stats Card */}
          <Card sx={{ boxShadow: '0 8px 32px rgba(0, 255, 136, 0.1)', border: '1px solid #2a2a2a', flex: 1, maxWidth: { lg: 280 } }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Avatar src={profile.avatarUrl} alt={profile.username} sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }} />
              <Typography variant="h6" fontWeight={700} mb={1}>
                {profile.username}
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" mb={2} gap={1}>
                <Chip label={profile.role} color="primary" size="small" />
                <Chip label={profile.status} size="small" variant="outlined" />
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={2}>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {profile._count?.posts ?? 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Yazı
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {profile._count?.comments ?? 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Yorum
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {profile._count?.likes ?? 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Beğeni
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Edit Form */}
          <Card sx={{ boxShadow: '0 8px 32px rgba(0, 255, 136, 0.1)', border: '1px solid #2a2a2a', flex: 2 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={700} mb={3}>
                Hesap Bilgileri
              </Typography>

              <form onSubmit={handleSave}>
                <Stack spacing={3}>
                  {/* Avatar Upload */}
                  <Box sx={{ bgcolor: '#1a1a1a', p: 3, borderRadius: 2, border: '1px dashed #2a2a2a' }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
                      <Box flex={1}>
                        <Typography variant="body2" fontWeight={600} mb={1}>
                          Avatar Resmini Değiştir
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                          PNG, JPG vya GIF (Max. 5MB)
                        </Typography>
                        <Button
                          component="label"
                          variant="outlined"
                          size="small"
                          startIcon={<Upload size={16} />}
                          disabled={uploading}
                          sx={{ textTransform: 'none' }}
                        >
                          {uploading ? 'Yükleniyor...' : 'Resim Seç'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            disabled={uploading}
                            hidden
                          />
                        </Button>
                      </Box>
                      <Avatar src={avatarUrl} alt={username} sx={{ width: 80, height: 80, flexShrink: 0 }} />
                    </Stack>
                  </Box>

                  <Divider />

                  {/* Form Fields */}
                  <TextField
                    label="Ad Soyad"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={saving}
                    size="small"
                  />

                  <TextField
                    label="Email Adresi"
                    type="email"
                    fullWidth
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={saving}
                    size="small"
                  />

                  <TextField
                    label="Kullanıcı Adı"
                    fullWidth
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={saving}
                    size="small"
                  />

                  <TextField
                    label="Biyografi"
                    fullWidth
                    multiline
                    minRows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={saving}
                    placeholder="Kendiniz hakkında birkaç satır yazın..."
                    size="small"
                  />

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} pt={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={saving || uploading}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </Button>
                    <Button
                      variant="outlined"
                      disabled={saving || uploading}
                      sx={{ textTransform: 'none' }}
                    >
                      İptal
                    </Button>
                  </Stack>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </Stack>
      </Container>    </Box>
  )
}

export default Profile