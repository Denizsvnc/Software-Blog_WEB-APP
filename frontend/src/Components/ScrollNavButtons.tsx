import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Fab, Stack, Tooltip, Zoom } from '@mui/material'
import { ArrowLeft, ArrowUp } from 'lucide-react'

function ScrollNavButtons() {
  const navigate = useNavigate()
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 300)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const canGoBack = typeof window !== 'undefined' && window.history.length > 1

  const handleBack = () => {
    if (canGoBack) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Stack
      spacing={1.5}
      sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300 }}
      alignItems="flex-end"
    >
      <Zoom in={canGoBack}>
        <Tooltip title="Önceki sayfa">
          <Fab
            size="small"
            onClick={handleBack}
            sx={{
              bgcolor: '#1a1a1a',
              color: '#00ff88',
              '&:hover': { bgcolor: '#242424' }
            }}
          >
            <ArrowLeft size={18} />
          </Fab>
        </Tooltip>
      </Zoom>
      <Zoom in={showTop}>
        <Tooltip title="Yukarı çık">
          <Fab
            size="small"
            color="primary"
            onClick={handleScrollTop}
            sx={{ boxShadow: '0 8px 24px rgba(0, 255, 136, 0.25)' }}
          >
            <ArrowUp size={18} />
          </Fab>
        </Tooltip>
      </Zoom>
    </Stack>
  )
}

export default ScrollNavButtons
