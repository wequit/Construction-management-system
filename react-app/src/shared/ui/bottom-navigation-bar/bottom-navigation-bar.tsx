import { useNavigate, useLocation } from "react-router-dom"
import { Home, FolderOpen, Bell, User } from "lucide-react"

export const BottomNavigationBar = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const data = [
        { label: 'Главная', Icon: Home, path: '/' },
        { label: 'Проекты', Icon: FolderOpen, path: '/projects' },
        { label: 'Уведомления', Icon: Bell, path: '/notifications' },
        { label: 'Профиль', Icon: User, path: '/profile' },
    ]

    return (
        <div className="fixed bottom-0 left-0 w-full h-16 bg-gray-900  flex items-center justify-around">
            {data.map(({ Icon, label, path }) => {
                const isActive = location.pathname === path

                return (
                    <button
                        key={label}
                        onClick={() => navigate(path)}
                        className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                            isActive
                                ? 'text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Icon size={24} />
                        <span className="text-xs mt-1">{label}</span>
                    </button>
                )
            })}
        </div>
    )
}    