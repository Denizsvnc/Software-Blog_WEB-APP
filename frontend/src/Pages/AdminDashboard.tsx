import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import type { ChipProps } from '@mui/material'
import { RefreshCw, ShieldCheck, ShieldQuestion, Trash2 } from 'lucide-react'
import api from '../api/api'
import type { Category, Post, User } from '../types'

interface DashboardStats {
  totalUsers: number
  totalPosts: number
  totalComments: number
}

interface AdminUser extends User {
  _count: {
    posts: number
    comments: number
  }
}

interface AdminCategory extends Category {
  _count: {
    posts: number
  }
}

interface NewsletterSubscriber {
  id: string
  email: string
  subscribedAt: string
  unsubscribed: boolean
  unsubscribedAt: string | null
  lastSentAt: string | null
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null)
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' })
  const [newsletterSubject, setNewsletterSubject] = useState('')
  const [newsletterMessage, setNewsletterMessage] = useState('')
  const [newsletterSending, setNewsletterSending] = useState(false)
  const [newsletterAlert, setNewsletterAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [newsletterActionLoadingId, setNewsletterActionLoadingId] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [statsRes, usersRes, categoriesRes, postsRes, newsletterRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/categories'),
        api.get('/admin/posts'),
        api.get('/admin/newsletter/subscribers')
      ])

      setStats(statsRes.data)
      setUsers(usersRes.data)
      setCategories(categoriesRes.data)
      setPosts(postsRes.data)
      setNewsletterSubscribers(newsletterRes.data)
    } catch (error) {
      console.error('AdminDashboard fetch error', error)
      setError('Panel verileri yüklenemedi. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleUserStatusToggle = async (user: AdminUser) => {
    if (saving) return
    try {
      setSaving(true)
      const nextStatus = user.status === 'BANNED' ? 'ACTIVE' : 'BANNED'
      await api.put(`/admin/users/${user.id}/status`, { status: nextStatus })
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u)))
    } catch (error) {
      console.error('AdminDashboard user status update failed', error)
      setError('Kullanıcı durumu güncellenemedi.')
    } finally {
      setSaving(false)
    }
  }

  const handleUserRoleChange = async (user: AdminUser, role: User['role']) => {
    if (saving || user.role === role) return
    try {
      setSaving(true)
      await api.put(`/admin/users/${user.id}/role`, { role })
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role } : u)))
    } catch (error) {
      console.error('AdminDashboard user role change failed', error)
      setError('Kullanıcı rolü güncellenemedi.')
    } finally {
      setSaving(false)
    }
  }

  const resetCategoryForm = () => {
    setCategoryForm({ name: '', description: '' })
    setEditCategoryId(null)
  }

  const handleCategorySubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!categoryForm.name.trim()) {
      setError('Kategori adı boş olamaz.')
      return
    }

    try {
      if (saving) return
      setSaving(true)
      if (editCategoryId) {
        const response = await api.put(`/admin/categories/${editCategoryId}`, categoryForm)
        setCategories((prev) =>
          prev.map((category) =>
            category.id === editCategoryId
              ? { ...category, ...response.data, _count: category._count }
              : category
          )
        )
      } else {
        const response = await api.post('/admin/categories', categoryForm)
        setCategories((prev) => [...prev, { ...response.data, _count: { posts: 0 } }])
      }
      resetCategoryForm()
    } catch (error) {
      console.error('AdminDashboard category save failed', error)
      setError('Kategori kaydedilemedi.')
    } finally {
      setSaving(false)
    }
  }

  const handleCategoryEdit = (category: AdminCategory) => {
    setEditCategoryId(category.id)
    setCategoryForm({ name: category.name, description: category.description ?? '' })
  }

  const handleCategoryDelete = async (categoryId: string) => {
    const confirmDelete = window.confirm('Kategoriyi silmek istediğinize emin misiniz?')
    if (!confirmDelete) return

    try {
      if (saving) return
      setSaving(true)
      await api.delete(`/admin/categories/${categoryId}`)
      setCategories((prev) => prev.filter((category) => category.id !== categoryId))
    } catch (error) {
      console.error('AdminDashboard category delete failed', error)
      setError('Kategori silinemedi. Bu kategori makalelerle ilişkili olabilir.')
    } finally {
      setSaving(false)
    }
  }

  const handlePostPublishToggle = async (post: Post) => {
    if (saving) return
    try {
      setSaving(true)
      await api.put(`/admin/posts/${post.id}/published`, { published: !post.published })
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, published: !post.published } : p)))
    } catch (error) {
      console.error('AdminDashboard post publish toggle failed', error)
      setError('Makale durumu güncellenemedi.')
    } finally {
      setSaving(false)
    }
  }

  const handlePostDelete = async (postId: string) => {
    const confirmDelete = window.confirm('Makaleyi silmek istediğinize emin misiniz?')
    if (!confirmDelete) return

    try {
      if (saving) return
      setSaving(true)
      await api.delete(`/admin/posts/${postId}`)
      setPosts((prev) => prev.filter((post) => post.id !== postId))
    } catch (error) {
      console.error('AdminDashboard post delete failed', error)
      setError('Makale silinemedi.')
    } finally {
      setSaving(false)
    }
  }

  const handleNewsletterSend = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!newsletterSubject.trim() || !newsletterMessage.trim()) {
      setNewsletterAlert({ type: 'error', message: 'Lütfen konu ve mesaj alanlarını doldurun.' })
      return
    }

    try {
      setNewsletterSending(true)
      setNewsletterAlert(null)

      const response = await api.post('/admin/newsletter/campaigns', {
        subject: newsletterSubject.trim(),
        message: newsletterMessage.trim()
      })

      const delivered = response.data?.delivered ?? 0
      const failed = Array.isArray(response.data?.failed) ? response.data.failed.length : 0

      setNewsletterAlert({
        type: failed > 0 ? 'error' : 'success',
        message:
          failed > 0
            ? `Bülten ${delivered} aboneye gönderildi ancak ${failed} adrese ulaşılamadı.`
            : `Bülten ${delivered} aboneye başarıyla gönderildi.`
      })

      setNewsletterSubject('')
      setNewsletterMessage('')

      const subscribersResponse = await api.get('/admin/newsletter/subscribers')
      setNewsletterSubscribers(subscribersResponse.data)
    } catch (error) {
      console.error('AdminDashboard newsletter send failed', error)
      setNewsletterAlert({ type: 'error', message: 'Bülten gönderimi başarısız oldu.' })
    } finally {
      setNewsletterSending(false)
    }
  }

  const handleNewsletterSubscriberAction = async (
    subscriber: NewsletterSubscriber,
    action: 'unsubscribe' | 'resubscribe' | 'remove'
  ) => {
    if (newsletterActionLoadingId) return

    if (action === 'remove') {
      const confirmed = window.confirm('Bu abonelik kaydını silmek istediğinize emin misiniz?')
      if (!confirmed) return
    }

    try {
      setNewsletterActionLoadingId(subscriber.id)
      setNewsletterAlert(null)

      await api.patch(`/admin/newsletter/subscribers/${subscriber.id}`, { action })

      if (action === 'remove') {
        setNewsletterSubscribers((prev) => prev.filter((item) => item.id !== subscriber.id))
        setNewsletterAlert({ type: 'success', message: `${subscriber.email} abonelik listesinden silindi.` })
        return
      }

      setNewsletterSubscribers((prev) =>
        prev.map((item) =>
          item.id === subscriber.id
            ? {
                ...item,
                unsubscribed: action === 'unsubscribe',
                unsubscribedAt: action === 'unsubscribe' ? new Date().toISOString() : null,
                subscribedAt: action === 'resubscribe' ? new Date().toISOString() : item.subscribedAt
              }
            : item
        )
      )

      setNewsletterAlert({
        type: 'success',
        message:
          action === 'unsubscribe'
            ? `${subscriber.email} aboneliği pasif hale getirildi.`
            : `${subscriber.email} aboneliği yeniden aktifleştirildi.`
      })
    } catch (error) {
      console.error('AdminDashboard subscriber update failed', error)
      setNewsletterAlert({ type: 'error', message: 'Abone bilgisi güncellenemedi.' })
    } finally {
      setNewsletterActionLoadingId(null)
    }
  }

  const statusColor = useMemo<Record<User['status'], ChipProps['color']>>(
    () => ({
      ACTIVE: 'success',
      BANNED: 'error',
      SUSPENDED: 'warning'
    }),
    []
  )

  const activeSubscriberCount = useMemo(
    () => newsletterSubscribers.filter((subscriber) => !subscriber.unsubscribed).length,
    [newsletterSubscribers]
  )

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto', py: 4, px: { xs: 2, md: 4 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight={700} color="primary.main">
          Yönetim Paneli
        </Typography>
        <Tooltip title="Verileri yenile">
          <IconButton onClick={fetchDashboardData} disabled={saving}>
            <RefreshCw size={18} />
          </IconButton>
        </Tooltip>
      </Stack>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {stats && (
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            mb: 4,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }
          }}
        >
          <Paper sx={{ p: 3, bgcolor: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Toplam Kullanıcı
            </Typography>
            <Typography variant="h4" fontWeight={700} color="primary.main">
              {stats.totalUsers}
            </Typography>
          </Paper>
          <Paper sx={{ p: 3, bgcolor: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Toplam Makale
            </Typography>
            <Typography variant="h4" fontWeight={700} color="secondary.main">
              {stats.totalPosts}
            </Typography>
          </Paper>
          <Paper sx={{ p: 3, bgcolor: 'rgba(255,0,110,0.08)', border: '1px solid rgba(255,0,110,0.2)' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Toplam Yorum
            </Typography>
            <Typography variant="h4" fontWeight={700} color="error.main">
              {stats.totalComments}
            </Typography>
          </Paper>
        </Box>
      )}

      <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          indicatorColor="primary"
          textColor="inherit"
          variant="scrollable"
        >
          <Tab label="Yazarlar" />
          <Tab label="Kategoriler" />
          <Tab label="Makaleler" />
          <Tab label="Bülten" />
        </Tabs>
        <Divider />

        {activeTab === 0 && (
          <Box p={3}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Yazar</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell align="right">Makaleler</TableCell>
                  <TableCell align="right">Yorumlar</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography fontWeight={600}>{user.name || user.username}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={user.role}
                          color={user.role === 'ADMIN' ? 'primary' : user.role === 'EDITOR' ? 'secondary' : 'default'}
                          size="small"
                        />
                        <Stack direction="row" spacing={1}>
                          {(['ADMIN', 'EDITOR', 'USER'] as User['role'][]).map((role) => (
                            <Button
                              key={role}
                              size="small"
                              variant={user.role === role ? 'contained' : 'outlined'}
                              onClick={() => handleUserRoleChange(user, role)}
                              disabled={saving || user.role === role}
                            >
                              {role}
                            </Button>
                          ))}
                        </Stack>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={user.status} color={statusColor[user.status]} size="small" />
                    </TableCell>
                    <TableCell align="right">{user._count.posts}</TableCell>
                    <TableCell align="right">{user._count.comments}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        color={user.status === 'BANNED' ? 'success' : 'warning'}
                        onClick={() => handleUserStatusToggle(user)}
                        startIcon={user.status === 'BANNED' ? <ShieldCheck size={16} /> : <ShieldQuestion size={16} />}
                        disabled={saving}
                      >
                        {user.status === 'BANNED' ? 'Aktif Et' : 'Askıya Al'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        {activeTab === 1 && (
          <Box p={3}>
            <Box component="form" onSubmit={handleCategorySubmit} mb={4}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'flex-end' }}>
                <TextField
                  label="Kategori Adı"
                  value={categoryForm.name}
                  onChange={(event) => setCategoryForm((prev) => ({ ...prev, name: event.target.value }))}
                  required
                  fullWidth
                />
                <TextField
                  label="Açıklama"
                  value={categoryForm.description}
                  onChange={(event) => setCategoryForm((prev) => ({ ...prev, description: event.target.value }))}
                  fullWidth
                />
                <Stack direction="row" spacing={1}>
                  <Button type="submit" variant="contained" disabled={saving}>
                    {editCategoryId ? 'Güncelle' : 'Ekle'}
                  </Button>
                  {editCategoryId && (
                    <Button variant="text" onClick={resetCategoryForm} disabled={saving}>
                      Vazgeç
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Box>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Kategori</TableCell>
                  <TableCell>Açıklama</TableCell>
                  <TableCell align="right">Makale Sayısı</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <Typography fontWeight={600}>{category.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {category.slug}
                      </Typography>
                    </TableCell>
                    <TableCell>{category.description || '-'}</TableCell>
                    <TableCell align="right">{category._count.posts}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button size="small" onClick={() => handleCategoryEdit(category)} disabled={saving}>
                          Düzenle
                        </Button>
                        <IconButton onClick={() => handleCategoryDelete(category.id)} disabled={saving}>
                          <Trash2 size={16} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        {activeTab === 2 && (
          <Box p={3}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Başlık</TableCell>
                  <TableCell>Yayın</TableCell>
                  <TableCell>Yazar</TableCell>
                  <TableCell>Kategoriler</TableCell>
                  <TableCell align="right">Beğeni</TableCell>
                  <TableCell align="right">Yorum</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography fontWeight={600}>{post.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={post.published ? 'Yayında' : 'Taslak'}
                        color={post.published ? 'success' : 'default'}
                        size="small"
                        onClick={() => handlePostPublishToggle(post)}
                      />
                    </TableCell>
                    <TableCell>{post.author?.username}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {post.categories?.map((category) => (
                          <Chip key={category.id} label={category.name} size="small" />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell align="right">{post._count?.likes ?? 0}</TableCell>
                    <TableCell align="right">{post._count?.comments ?? 0}</TableCell>
                    <TableCell align="right">
                      <Button color="error" size="small" onClick={() => handlePostDelete(post.id)} disabled={saving}>
                        Sil
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        {activeTab === 3 && (
          <Box p={3}>
            <Stack spacing={3}>
              {newsletterAlert && (
                <Alert severity={newsletterAlert.type} onClose={() => setNewsletterAlert(null)}>
                  {newsletterAlert.message}
                </Alert>
              )}

              <Box
                component="form"
                onSubmit={handleNewsletterSend}
                sx={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, p: 3 }}
              >
                <Stack spacing={2}>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Toplu Bülten Gönder
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Aktif aboneler: {activeSubscriberCount}
                    </Typography>
                  </Stack>
                  <TextField
                    label="Konu"
                    value={newsletterSubject}
                    onChange={(event) => setNewsletterSubject(event.target.value)}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Mesaj"
                    value={newsletterMessage}
                    onChange={(event) => setNewsletterMessage(event.target.value)}
                    required
                    fullWidth
                    multiline
                    minRows={4}
                    helperText="Mesaj HTML olmadan basit metin olarak gönderilir. Satır sonları otomatik düzenlenir."
                  />
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button type="submit" variant="contained" disabled={newsletterSending}>
                      {newsletterSending ? 'Gönderiliyor...' : 'Bülteni Gönder'}
                    </Button>
                  </Stack>
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                  Abone Listesi
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>E-posta</TableCell>
                      <TableCell>Durum</TableCell>
                      <TableCell>Abonelik Tarihi</TableCell>
                      <TableCell>Son Gönderim</TableCell>
                      <TableCell align="right">İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {newsletterSubscribers.map((subscriber) => (
                      <TableRow key={subscriber.id}>
                        <TableCell>{subscriber.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={subscriber.unsubscribed ? 'Pasif' : 'Aktif'}
                            color={subscriber.unsubscribed ? 'default' : 'success'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(subscriber.subscribedAt).toLocaleDateString('tr-TR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          {subscriber.lastSentAt
                            ? new Date(subscriber.lastSentAt).toLocaleString('tr-TR')
                            : 'Henüz gönderim yapılmadı'}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() =>
                                handleNewsletterSubscriberAction(
                                  subscriber,
                                  subscriber.unsubscribed ? 'resubscribe' : 'unsubscribe'
                                )
                              }
                              disabled={newsletterActionLoadingId === subscriber.id}
                            >
                              {subscriber.unsubscribed ? 'Aktifleştir' : 'Pasifleştir'}
                            </Button>
                            <IconButton
                              color="error"
                              onClick={() => handleNewsletterSubscriberAction(subscriber, 'remove')}
                              disabled={newsletterActionLoadingId === subscriber.id}
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                    {newsletterSubscribers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          Henüz abone bulunmuyor.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Stack>
          </Box>
        )}
      </Paper>
    </Box>
  )
}

export default AdminDashboard
