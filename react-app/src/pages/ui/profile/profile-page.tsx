import { mockProfile } from "@/entities/user/model/mock";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Briefcase, 
  Building2, 
  User, 
  CheckCircle2, 
  XCircle, 
  Pencil,
  Shield,
  LogOut,
  Bell
} from "lucide-react";
import type { ProfileCardType } from "@/entities/user/model/types";
import { useNavigate } from "react-router-dom";

export function ProfilePage() {
  const navigate = useNavigate();
  const profile: ProfileCardType = mockProfile[0];

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      'ADMIN': 'Администратор',
      'USER': 'Пользователь',
      'MANAGER': 'Менеджер',
      'EMPLOYEE': 'Сотрудник'
    };
    return roleLabels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'ADMIN': 'bg-purple-500/20 border-purple-500/50 text-purple-400',
      'MANAGER': 'bg-blue-500/20 border-blue-500/50 text-blue-400',
      'EMPLOYEE': 'bg-green-500/20 border-green-500/50 text-green-400',
      'USER': 'bg-gray-500/20 border-gray-500/50 text-gray-400',
    };
    return colors[role] || colors['USER'];
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0b1020] text-white pb-20">
      <div className="space-y-4 px-4 pt-4">
        <Card className="bg-[#0f1729] border-gray-800">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative group">
                <Avatar className="h-28 w-28 border-4 border-gray-700 shadow-lg">
                  <AvatarImage
                    src={profile.photo}
                    alt={profile.name || profile.email}
                  />
                </Avatar>
                <button className="absolute bottom-0 right-0 p-2.5 bg-blue-600 rounded-full hover:bg-blue-700 transition-all shadow-lg hover:scale-110">
                  <Pencil className="h-4 w-4 text-white" />
                </button>
              </div>

              {profile.name && (
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  {profile.username && (
                    <p className="text-sm text-gray-400">@{profile.username}</p>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <Badge 
                  variant={profile.active ? "default" : "destructive"} 
                  className="text-xs"
                >
                  {profile.active ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Активен
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Неактивен
                    </>
                  )}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getRoleColor(profile.role)}`}
                >
                  <Shield className="h-3 w-3 mr-1" />
                  {getRoleLabel(profile.role)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Личная информация */}
        <div className="grid grid-cols-1 gap-3">
          <Card className="bg-[#0f1729] border-gray-800">
            <CardHeader className="pb-2 pt-4 pl-12">
              <h3 className="text-lg font-semibold">Личная информация</h3>
            </CardHeader>
            <CardContent className="pb-4 pl-12 space-y-2">
              <div className="flex items-center gap-3 py-2.5">
                <div className="p-1.5 bg-blue-500/10 rounded-lg shrink-0">
                  <User className="h-4 w-4 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-0.5">ID пользователя</p>
                  <p className="text-sm font-medium text-gray-200">{profile.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 py-2.5">
                <div className="p-1.5 bg-blue-500/10 rounded-lg shrink-0">
                  <Mail className="h-4 w-4 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-0.5">Email</p>
                  <p className="text-sm font-medium text-gray-200 break-words">{profile.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1729] border-gray-800">
            <CardHeader className="pb-2 pt-4 pl-12">
              <h3 className="text-lg font-semibold">Рабочая информация</h3>
            </CardHeader>
            <CardContent className="pb-4 pl-12 space-y-2">
              <div className="flex items-center gap-3 py-2.5">
                <div className="p-1.5 bg-green-500/10 rounded-lg shrink-0">
                  <Briefcase className="h-4 w-4 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-0.5">Должность</p>
                  <p className="text-sm font-medium text-gray-200">{profile.position}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 py-2.5">
                <div className="p-1.5 bg-purple-500/10 rounded-lg shrink-0">
                  <Building2 className="h-4 w-4 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-0.5">Компания</p>
                  <p className="text-sm font-medium text-gray-200">{profile.companyName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">ID: {profile.companyId}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Дополнительные действия */}
        <div className="space-y-2">
          <button className="w-full p-3 bg-[#0f1729] border border-gray-800 rounded-lg hover:bg-[#0b1020] transition-colors text-left">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-gray-500/10 rounded-lg shrink-0">
                <Pencil className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-200">Редактировать профиль</p>
                <p className="text-xs text-gray-500">Изменить личную информацию</p>
              </div>
            </div>
          </button>

          <button  onClick={() => navigate('/notifications')} className="w-full p-3 bg-[#0f1729] border border-gray-800 rounded-lg hover:bg-[#0b1020] transition-colors text-left">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-gray-500/10 rounded-lg shrink-0">
                <Bell className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-200" >Уведомления</p>
                <p className="text-xs text-gray-500">Настройки уведомлений</p>
              </div>
            </div>
          </button>

          <button  onClick={() => logout()} className="w-full p-3 bg-[#0f1729] border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors text-left">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-red-500/10 rounded-lg shrink-0">
                <LogOut className="h-4 w-4 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-400">Выйти</p>
                <p className="text-xs text-gray-500">Выйти из аккаунта</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

