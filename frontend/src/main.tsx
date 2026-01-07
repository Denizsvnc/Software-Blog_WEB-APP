import { createTheme, ThemeProvider } from '@mui/material/styles'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import CssBaseline from '@mui/material/CssBaseline'
import logoUrl from './logo.png'

document.title = 'Yazılım Blog'

const existingFavicon = document.querySelector("link[rel='icon']") as HTMLLinkElement | null

if (existingFavicon) {
  existingFavicon.href = logoUrl
  existingFavicon.type = 'image/png'
} else {
  const favicon = document.createElement('link')
  favicon.rel = 'icon'
  favicon.type = 'image/png'
  favicon.href = logoUrl
  document.head.appendChild(favicon)
}

const darkNeonTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a'
    },
    primary: {
      main: '#00ff88',
      light: '#33ff99',
      dark: '#00cc6f',
      contrastText: '#000000'
    },
    secondary: {
      main: '#ff006e',
      light: '#ff3385',
      dark: '#cc0056',
      contrastText: '#ffffff'
    },
    error: {
      main: '#ff0055',
      light: '#ff3366',
      dark: '#cc0044'
    },
    warning: {
      main: '#ffbe0b',
      light: '#ffcc33',
      dark: '#cc9600'
    },
    success: {
      main: '#00ff88',
      light: '#33ff99',
      dark: '#00cc6f'
    },
    info: {
      main: '#00d4ff',
      light: '#33e0ff',
      dark: '#00aacc'
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
      disabled: '#666666'
    },
    divider: '#333333',
    action: {
      active: '#00ff88',
      hover: '#ffffff1a',
      selected: '#00ff881a',
      disabled: '#666666',
      disabledBackground: '#2a2a2a'
    }
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  shape: {
    borderRadius: 16
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(0, 255, 136, 0.2)'
          }
        },
        contained: {
          background: 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)',
          color: '#000000',
          '&:hover': {
            background: 'linear-gradient(135deg, #33ff99 0%, #33e0ff 100%)',
            boxShadow: '0 8px 24px rgba(0, 255, 136, 0.3)'
          }
        },
        outlined: {
          borderColor: '#00ff88',
          color: '#00ff88',
          '&:hover': {
            borderColor: '#33ff99',
            backgroundColor: 'rgba(0, 255, 136, 0.1)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          backgroundColor: '#1a1a1a',
          border: '1px solid #2a2a2a',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: '#00ff8844',
            boxShadow: '0 8px 32px rgba(0, 255, 136, 0.15)'
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 14,
            backgroundColor: '#0f0f0f',
            '& fieldset': {
              borderColor: '#2a2a2a',
              borderRadius: 14
            },
            '&:hover fieldset': {
              borderColor: '#00ff88'
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00ff88',
              boxShadow: '0 0 12px rgba(0, 255, 136, 0.3)'
            }
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          borderBottom: '1px solid #2a2a2a',
          boxShadow: 'none'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          border: '1px solid #00ff8844'
        },
        colorPrimary: {
          backgroundColor: 'rgba(0, 255, 136, 0.1)',
          color: '#00ff88',
          '&:hover': {
            backgroundColor: 'rgba(0, 255, 136, 0.2)',
            borderColor: '#00ff88'
          }
        }
      }
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          borderRadius: '50%',
          border: '2px solid #00ff8844'
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: 'none'
        },
        standardError: {
          backgroundColor: 'rgba(255, 0, 85, 0.1)',
          color: '#ff0055'
        },
        standardSuccess: {
          backgroundColor: 'rgba(0, 255, 136, 0.1)',
          color: '#00ff88'
        },
        standardWarning: {
          backgroundColor: 'rgba(255, 190, 11, 0.1)',
          color: '#ffbe0b'
        },
        standardInfo: {
          backgroundColor: 'rgba(0, 212, 255, 0.1)',
          color: '#00d4ff'
        }
      }
    }
  }
})

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ThemeProvider theme={darkNeonTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </BrowserRouter>
)
