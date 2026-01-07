import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/api'
import type { User } from '../types'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Alert,
  Button,
  CircularProgress,
  Chip
} from '@mui/material'
import { Calendar } from 'lucide-react'

interface PublicProfile extends User {
  _count?: {
    posts: number
    comments: number
  }
}

function UserProfile() {
  const { username } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      if (!username) return
      try {
        const res = await api.get(`/users/${username}`)
        setProfile(res.data)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Profil yüklenemedi'
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [username])

  if (loading) {
    return (
      <Box minHeight="60vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    )
  }

  if (!profile) {
    return <Alert severity="error">Profil bulunamadı</Alert>
  }

  return (
    <Box minHeight="100vh" bgcolor="#0a0a0a" p={2}>
      <Box maxWidth="800px" mx="auto">
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Card sx={{ boxShadow: '0 8px 32px rgba(0, 255, 136, 0.1)', border: '1px solid #2a2a2a' }}>
          <CardContent sx={{ p: 4 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', sm: 'center' }} mb={3}>
              <Avatar src={profile.avatarUrl} alt={profile.username} sx={{ width: 100, height: 100 }} />
              <Box flex={1}>
                <Typography variant="h5" fontWeight={700} mb={0.5}>
                  {profile.name || profile.username}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" mb={1}>
                  @{profile.username}
                </Typography>
                {profile.bio && (
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    {profile.bio}
                  </Typography>
                )}
                <Stack direction="row" spacing={1} alignItems="center" color="text.secondary" mb={2}>
                  <Calendar size={16} />
                  <Typography variant="caption">
                    Katılma: {new Date(profile.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label={`${profile._count?.posts ?? 0} Yazı`} size="small" />
                  <Chip label={`${profile._count?.comments ?? 0} Yorum`} size="small" />
                  <Chip label={profile.role} color="primary" size="small" />
                </Stack>
              </Box>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Button variant="outlined" onClick={() => navigate(`/users/${username}/posts`)}>
                Yazılarını Gör
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

export default UserProfile
