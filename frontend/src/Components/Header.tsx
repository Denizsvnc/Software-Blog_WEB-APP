import * as React from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Menu from '@mui/material/Menu'
import MenuIcon from '@mui/icons-material/Menu'
import Container from '@mui/material/Container'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import logoImg from '../logo.png'

const pages = [
  { label: 'Ana Sayfa', path: '/' },
  { label: 'Popüler', path: '/popular' },
  { label: 'Kategoriler', path: '/categories' }
]
const settings = ['Profil', 'Çıkış Yap']

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null)
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null)
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget)
  }
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleCloseNavMenu = (path?: string) => {
    return () => {
      setAnchorElNav(null)
      if (path) navigate(path)
    }
  }

  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
  }

  const handleSettingClick = (setting: string) => {
    handleCloseUserMenu()
    if (setting === 'Çıkış Yap') {
      logout()
      navigate('/login')
      return
    }
    if (setting === 'Yönetim Paneli') {
      navigate('/admin')
      return
    }
    if (setting === 'Profil') {
      navigate('/profile')
    }
  }

  return (
    <AppBar
      position="sticky"
      sx={{
        boxShadow: isScrolled ? '0 6px 24px rgba(0, 255, 136, 0.12)' : '0 2px 12px rgba(0, 255, 136, 0.1)',
        bgcolor: isScrolled ? 'rgba(10, 10, 10, 0.92)' : '#1a1a1a',
        borderBottom: '1px solid #2a2a2a',
        color: 'text.primary',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        top: 0
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            gap: 3,
            transition: 'all 0.3s ease',
            minHeight: { xs: isScrolled ? 56 : 70, md: isScrolled ? 64 : 88 },
            py: isScrolled ? 1 : 2
          }}
        >
          <Box
            onClick={() => navigate('/')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer'
            }}
          >
            <Box
              component="img"
              src={logoImg}
              alt="Yazılım Blog logosu"
              sx={{
                width: { xs: isScrolled ? 32 : 40, md: isScrolled ? 36 : 44 },
                height: { xs: isScrolled ? 32 : 40, md: isScrolled ? 36 : 44 },
                borderRadius: '50%',
                border: '2px solid #00ff8844',
                boxShadow: '0 0 12px rgba(0, 255, 136, 0.2)',
                transition: 'all 0.3s ease'
              }}
            />
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: { xs: isScrolled ? '1.15rem' : '1.25rem', md: isScrolled ? '1.35rem' : '1.5rem' },
                letterSpacing: '-0.5px'
              }}
            >
              Yazılım Blog
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {pages.map((page) => (
              <Button
                key={page.path}
                onClick={handleCloseNavMenu(page.path)}
                sx={{
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main', bgcolor: 'transparent' },
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 500
                }}
              >
                {page.label}
              </Button>
            ))}
            {user?.role === 'ADMIN' && (
              <Button
                onClick={() => navigate('/admin')}
                sx={{
                  color: 'primary.main',
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 600
                }}
              >
                Yönetim
              </Button>
            )}
          </Box>

          {/* Mobile Navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left'
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left'
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu()}
            >
              {pages.map((page) => (
                <MenuItem key={page.path} onClick={handleCloseNavMenu(page.path)}>
                  <Typography sx={{ textAlign: 'center' }}>{page.label}</Typography>
                </MenuItem>
              ))}
              {user?.role === 'ADMIN' && (
                <MenuItem onClick={handleCloseNavMenu('/admin')}>
                  <Typography sx={{ textAlign: 'center' }}>Yönetim</Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>

          {/* Right Side: User/Auth */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {isAuthenticated ? (
              <>
                <Button
                  color="inherit"
                  onClick={() => navigate('/posts/new')}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  Yeni Makale
                </Button>
                <Tooltip title={user?.username || 'Profil'}>
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={user?.username} src={user?.avatarUrl} sx={{ width: 36, height: 36 }} />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {(user?.role === 'ADMIN' ? ['Yönetim Paneli', ...settings] : settings).map((setting) => (
                    <MenuItem key={setting} onClick={() => handleSettingClick(setting)}>
                      <Typography sx={{ textAlign: 'center' }}>{setting}</Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : (
              <>
                <Button
                  color="inherit"
                  onClick={() => navigate('/login')}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  Giriş Yap
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/register')}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  Kayıt Ol
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
export default ResponsiveAppBar