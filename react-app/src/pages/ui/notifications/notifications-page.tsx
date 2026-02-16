import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  XCircle,
  CheckCheck,
  Filter,
  Trash2
} from "lucide-react"

interface Notification {
  id: number
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  time: string
  read: boolean
  projectId?: number
  projectName?: string
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'warning',
    title: 'Просрочен срок исполнения',
    message: 'Документ "Градостроительное заключение" по проекту "Жилой комплекс Солнечный" просрочен на 3 дня',
    time: '2 часа назад',
    read: false,
    projectId: 1,
    projectName: 'Жилой комплекс Солнечный'
  },
  {
    id: 2,
    type: 'info',
    title: 'Новый комментарий',
    message: 'Добавлен комментарий к разделу "Эскизный проект"',
    time: '5 часов назад',
    read: false,
    projectId: 1,
    projectName: 'Жилой комплекс Солнечный'
  },
  {
    id: 3,
    type: 'success',
    title: 'Документ утверждён',
    message: 'Документ "Инженерные технические условия" успешно утверждён',
    time: 'Вчера, 14:30',
    read: true,
    projectId: 2,
    projectName: 'Бизнес-центр Офис'
  },
  {
    id: 4,
    type: 'error',
    title: 'Ошибка загрузки файла',
    message: 'Не удалось загрузить файл "ППР.pdf". Проверьте формат и размер файла',
    time: 'Вчера, 10:15',
    read: false
  },
  {
    id: 5,
    type: 'info',
    title: 'Назначен новый исполнитель',
    message: 'Вам назначен раздел "Согласование с МЧС" в проекте "Жилой комплекс Солнечный"',
    time: '2 дня назад',
    read: true,
    projectId: 1,
    projectName: 'Жилой комплекс Солнечный'
  },
  {
    id: 6,
    type: 'warning',
    title: 'Требуется ваше внимание',
    message: '3 документа требуют согласования в течение 2 дней',
    time: '3 дня назад',
    read: true
  },
  {
    id: 7,
    type: 'success',
    title: 'Проект завершён',
    message: 'Проект "Бизнес-центр Офис" успешно завершён и добавлен в архив',
    time: 'Неделю назад',
    read: true,
    projectId: 2,
    projectName: 'Бизнес-центр Офис'
  }
]

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-400" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-400" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-400" />
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-400" />
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/30'
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30'
      case 'error':
        return 'bg-red-500/10 border-red-500/30'
      case 'info':
      default:
        return 'bg-blue-500/10 border-blue-500/30'
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read
    if (filter === 'read') return n.read
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <div className="min-h-screen bg-[#0b1020] text-white pb-20">
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-blue-400" />
            <h1 className="text-2xl font-bold">Уведомления</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-[#0f1729] border border-gray-800 rounded-lg hover:bg-[#0b1020] transition-colors"
            >
              <CheckCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Отметить все</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-[#0f1729] border border-gray-800 text-gray-300 hover:bg-[#0b1020]'
            }`}
          >
            <Filter className="h-4 w-4" />
            Все
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-[#0f1729] border border-gray-800 text-gray-300 hover:bg-[#0b1020]'
            }`}
          >
            Непрочитанные
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0">
                {unreadCount}
              </Badge>
            )}
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filter === 'read'
                ? 'bg-blue-600 text-white'
                : 'bg-[#0f1729] border border-gray-800 text-gray-300 hover:bg-[#0b1020]'
            }`}
          >
            Прочитанные
          </button>
        </div>

        {filteredNotifications.length === 0 ? (
          <Card className="bg-[#0f1729] border-gray-800">
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">
                {filter === 'unread' 
                  ? 'Нет непрочитанных уведомлений' 
                  : filter === 'read'
                  ? 'Нет прочитанных уведомлений'
                  : 'Нет уведомлений'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`bg-[#0f1729] border-gray-800 transition-all ${
                  !notification.read ? 'border-l-4 border-l-blue-500' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)} shrink-0`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`font-semibold ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="h-2 w-2 bg-blue-500 rounded-full shrink-0 mt-2" />
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{notification.time}</span>
                          {notification.projectName && (
                            <>
                              <span>•</span>
                              <span className="text-blue-400">{notification.projectName}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1.5 text-gray-500 hover:text-blue-400 transition-colors"
                              title="Отметить как прочитанное"
                            >
                              <CheckCheck className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                            title="Удалить"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
