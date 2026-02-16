import { useState } from "react"
import { useNavigate } from "react-router-dom" // или useNavigation из @react-navigation/native для RN
import { Mail, Lock, LogIn } from "lucide-react"

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      setEmailError("Email обязателен")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError("Некорректный email")
      return false
    }
    setEmailError("")
    return true
  }

  const validatePassword = (value: string) => {
    if (!value.trim()) {
      setPasswordError("Пароль обязателен")
      return false
    }
    if (value.length < 6) {
      setPasswordError("Минимум 6 символов")
      return false
    }
    setPasswordError("")
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateEmail(email) || !validatePassword(password)) return

    setIsLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Ошибка авторизации')
      }

      const data = await response.json().catch(() => ({}))
      const token = data.token ?? data.accessToken ?? data.access_token
      if (token) {
        localStorage.setItem('token', token)
      }
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось войти. Проверьте данные.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0b1020] flex flex-col items-center justify-center px-5 safe-area-inset">
      <div className="w-full max-w-[380px]">
        <div className="rounded-2xl border border-gray-800/80 bg-[#0f1729]/80 backdrop-blur-sm p-6 sm:p-8 shadow-xl shadow-black/20">
          <div className="text-center space-y-1 mb-8">
            <h1 className="text-xl font-semibold tracking-tight text-white">Вход</h1>
            <p className="text-sm text-gray-500">
              Введите данные для входа
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-gray-500">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value)
                    if (emailError) validateEmail(e.target.value)
                  }}
                  onBlur={() => validateEmail(email)}
                  placeholder="example@mail.com"
                  className={`w-full pl-11 pr-4 py-3.5 bg-[#111827] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-500 transition-all text-sm ${
                    emailError ? 'border-red-800/80 focus:ring-red-900/50' : 'border-gray-700/80'
                  }`}
                  disabled={isLoading}
                />
              </div>
              {emailError && <p className="text-xs text-red-400/90 pl-1">{emailError}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wider text-gray-500">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value)
                    if (passwordError) validatePassword(e.target.value)
                  }}
                  onBlur={() => validatePassword(password)}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-4 py-3.5 bg-[#111827] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-500 transition-all text-sm ${
                    passwordError ? 'border-red-800/80 focus:ring-red-900/50' : 'border-gray-700/80'
                  }`}
                  disabled={isLoading}
                />
              </div>
              {passwordError && <p className="text-xs text-red-400/90 pl-1">{passwordError}</p>}
            </div>

            {error && (
              <div className="bg-red-950/30 border border-red-900/40 text-red-300/90 text-center py-2.5 px-4 rounded-xl text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !!emailError || !!passwordError}
              className="w-full mt-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 text-white font-medium py-3.5 px-6 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Входим…</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Войти</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}