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
      await new Promise(r => setTimeout(r, 1200)) // симуляция API
      localStorage.setItem('token', 'temp_token')
      navigate('/')
    } catch {
      setError("Не удалось войти. Проверьте данные.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] flex flex-col items-center justify-center px-5 safe-area-inset">
      {/* safe-area-inset — для notch и dynamic island, в RN используй SafeAreaView */}

      <div className="w-full max-w-[380px] space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-white">Вход</h1>
          <p className="text-base text-gray-400">
            Введите данные для входа в приложение
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
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
                className={`w-full pl-12 pr-4 py-4 bg-[#111827] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all text-base ${
                  emailError ? 'border-red-600 focus:border-red-600' : ''
                }`}
                disabled={isLoading}
              />
            </div>
            {emailError && <p className="text-sm text-red-500 pl-1">{emailError}</p>}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Пароль
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value)
                  if (passwordError) validatePassword(e.target.value)
                }}
                onBlur={() => validatePassword(password)}
                placeholder="••••••••••"
                className={`w-full pl-12 pr-4 py-4 bg-[#111827] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all text-base ${
                  passwordError ? 'border-red-600 focus:border-red-600' : ''
                }`}
                disabled={isLoading}
              />
            </div>
            {passwordError && <p className="text-sm text-red-500 pl-1">{passwordError}</p>}
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-800/50 text-red-300 text-center py-3 px-4 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !!emailError || !!passwordError}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:opacity-60 text-white font-medium py-4 px-6 rounded-xl transition-colors text-base flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <>
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Входим…</span>
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                <span>Войти</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center space-y-4 text-sm">
          <button
            type="button"
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
            onClick={() => console.log("Забыли пароль?")}
          >
            Забыли пароль?
          </button>

          <div className="text-gray-500">
            Нет аккаунта?{" "}
            <button
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              onClick={() => console.log("Регистрация")}
            >
              Зарегистрироваться
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}