import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/api'
import type { AxiosError } from 'axios'
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
  Stepper,
  Step,
  StepLabel,
  Divider
} from '@mui/material'

function Register() {
  const [activeStep, setActiveStep] = useState(0)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const steps = ['Hesap Bilgileri', 'Email Doğrulama']

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('/auth/register', { email, username, password })
      setActiveStep(1)
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ error?: string }>
      const errorMessage = axiosError.response?.data?.error || (err instanceof Error ? err.message : 'Kayıt başarısız')
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('/auth/verify-email', { email, code: verificationCode })
      await login(email, password)
      navigate('/')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Doğrulama başarısız'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/resend-verification', { email })
      alert('Doğrulama kodu tekrar gönderildi!')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Kod gönderilemedi'
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
                Kayıt Ol
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Yeni bir hesap oluştur ve başla
              </Typography>
            </Stack>

            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {/* Step 1: Account Info */}
            {activeStep === 0 && (
              <form onSubmit={handleRegisterSubmit}>
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
                    label="Kullanıcı Adı"
                    type="text"
                    fullWidth
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    placeholder="yourname"
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
                    helperText="En az 6 karakter olmalıdır"
                    size="small"
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={loading}
                    sx={{ fontWeight: 600, textTransform: 'none' }}
                  >
                    {loading ? 'Kaydediliyor...' : 'Devam Et'}
                  </Button>
                </Stack>
              </form>
            )}

            {/* Step 2: Email Verification */}
            {activeStep === 1 && (
              <form onSubmit={handleVerificationSubmit}>
                <Stack spacing={2.5}>
                  <Alert severity="info" sx={{ bgcolor: '#e3f2fd', color: 'text.primary' }}>
                    <strong>{email}</strong> adresine 6 haneli doğrulama kodu gönderdik.
                  </Alert>

                  <TextField
                    label="Doğrulama Kodu"
                    type="text"
                    fullWidth
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    disabled={loading}
                    placeholder="123456"
                    inputProps={{ maxLength: 6, pattern: '[0-9]{6}' }}
                    size="small"
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={loading}
                    sx={{ fontWeight: 600, textTransform: 'none' }}
                  >
                    {loading ? 'Doğrulanıyor...' : 'Doğrula ve Kayıt Ol'}
                  </Button>

                  <Stack direction="row" spacing={1}>
                    <Button
                      onClick={handleResendCode}
                      variant="outlined"
                      fullWidth
                      disabled={loading}
                      size="small"
                      sx={{ textTransform: 'none' }}
                    >
                      Kodu Tekrar Gönder
                    </Button>
                    <Button
                      onClick={() => setActiveStep(0)}
                      variant="outlined"
                      fullWidth
                      size="small"
                      sx={{ textTransform: 'none' }}
                    >
                      Geri Dön
                    </Button>
                  </Stack>
                </Stack>
              </form>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Login Link */}
            <Typography variant="body2" textAlign="center" color="text.secondary">
              Zaten hesabınız var mı?{' '}
              <Link to="/login" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 600 }}>
                Giriş Yap
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Container>    </Box>
  )
}

export default Register