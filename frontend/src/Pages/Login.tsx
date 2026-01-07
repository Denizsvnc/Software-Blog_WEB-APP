import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Box,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  FormControlLabel,
  Checkbox,
  Divider
} from '@mui/material'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password, rememberMe)
      navigate('/')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Giriş başarısız'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="#0a0a0a" py={4}>
      <Container maxWidth="sm">
        <Card sx={{ boxShadow: '0 8px 32px rgba(0, 255, 136, 0.1)', border: '1px solid #2a2a2a' }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {/* Header */}
            <Stack spacing={2} mb={3} textAlign="center">
              <Typography variant="h4" fontWeight={700}>
                Giriş Yap
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hesabınıza erişmek için giriş yapın
              </Typography>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  label="Email Adresi"
                  type="email"
                  fullWidth
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  placeholder="you@example.com"
                  size="small"
                />

                <TextField
                  label="Şifre"
                  type="password"
                  fullWidth
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  size="small"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      color="primary"
                      disabled={loading}
                    />
                  }
                  label="Beni Hatırla"
                  sx={{ ml: 0 }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{ fontWeight: 600, textTransform: 'none' }}
                >
                  {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                </Button>
              </Stack>
            </form>

            <Divider sx={{ my: 3 }} />

            {/* Sign Up Link */}
            <Typography variant="body2" textAlign="center" color="text.secondary">
              Hesabınız yok mu?{' '}
              <Link to="/register" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 600 }}>
                Kayıt Ol
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}

export default Login
