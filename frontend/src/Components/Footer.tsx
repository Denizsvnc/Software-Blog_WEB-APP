import { Box, Container, Typography, Link, Stack, Divider } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import logoImg from '../logo.png'

function Footer() {
  const navigate = useNavigate()

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#1a1a1a',
        borderTop: '1px solid #2a2a2a',
        py: 6,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 4,
            mb: 4
          }}
        >
          <Box>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              mb={2}
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              <Box
                component="img"
                src={logoImg}
                alt="Yazılım Blog logosu"
                sx={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #00ff8844', boxShadow: '0 0 8px rgba(0, 255, 136, 0.15)' }}
              />
              <Typography variant="body1" fontWeight={700} sx={{
                background: 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Yazılım Blog
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              Yazılım geliştirme ve teknoloji odaklı makaleleri tek noktada keşfedin. Popüler içerikler ve yeni paylaşımlar haftalık olarak güncellenir.
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={600} mb={2} color="text.primary">
              Hızlı Erişim
            </Typography>
            <Stack spacing={1}>
              {[{ label: 'Ana Sayfa', path: '/' }, { label: 'Popüler', path: '/popular' }, { label: 'Kategoriler', path: '/categories' }, { label: 'Yeni Makale', path: '/posts/new' }].map((item) => (
                <Link
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    color: 'text.secondary',
                    cursor: 'pointer',
                    '&:hover': { color: 'primary.main' },
                    textDecoration: 'none'
                  }}
                >
                  <Typography variant="body2">{item.label}</Typography>
                </Link>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={600} mb={2} color="text.primary">
              İletişim
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Sorularınız için: <Link href="mailto:destek@blog.com" sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>destek@blog.com</Link>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Feedback ve önerileriniz bizim için değerli.
              </Typography>
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Bottom Section */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Typography variant="body2" color="text.secondary">
            Deniz SEVİNÇ
          </Typography>
        </Stack>
      </Container>
    </Box>
  )
}

export default Footer
