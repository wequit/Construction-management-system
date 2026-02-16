import { Card, CardContent,  CardHeader, CardTitle, } from "@/components/ui/card"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { ProfileCardType } from "../model/types";
import { Pencil, Mail, Briefcase, Building2, User, CheckCircle2, XCircle } from "lucide-react";

export const ProfileCard = ({ profile }: { profile: ProfileCardType }) => {
    const getRoleLabel = (role: string) => {
        const roleLabels: Record<string, string> = {
            'ADMIN': 'Администратор',
            'USER': 'Пользователь',
            'MANAGER': 'Менеджер',
            'EMPLOYEE': 'Сотрудник'
        };
        return roleLabels[role] || role;
    };

    return (
        <div>
            <Card className="bg-[#0f1729] border-gray-800 overflow-hidden hover:border-gray-700 transition-colors h-full flex flex-col">
                <CardHeader className="pb-3 md:pb-4">
                    <div className="flex items-start justify-between mb-4">
                        <CardTitle className="text-xl font-bold">Профиль</CardTitle>
                        <Pencil size={17} className="text-gray-600 hover:text-white cursor-pointer" />
                    </div>
                    
                    {profile.photo && (
                        <div className="flex justify-center mb-4">
                            <Avatar className="h-24 w-24">
                                <AvatarImage
                                    src={profile.photo}
                                    alt={profile.name || profile.email}
                                />
                            </Avatar>
                        </div>
                    )}

                    {profile.name && (
                        <div className="mb-4">
                            <p className="text-gray-300 text-sm mb-1">Имя</p>
                            <h2 className="text-lg font-extrabold">{profile.name}</h2>
                        </div>
                    )}
                </CardHeader>
                
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div className="flex-1">
                                <p className="text-gray-300 text-xs mb-1">ID</p>
                                <p className="text-sm text-gray-200">{profile.id}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <div className="flex-1">
                                <p className="text-gray-300 text-xs mb-1">Email</p>
                                <p className="text-sm text-gray-200">{profile.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-gray-400" />
                            <div className="flex-1">
                                <p className="text-gray-300 text-xs mb-1">Роль</p>
                                <Badge variant="outline" className="text-xs">
                                    {getRoleLabel(profile.role)}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-gray-400" />
                            <div className="flex-1">
                                <p className="text-gray-300 text-xs mb-1">Должность</p>
                                <p className="text-sm text-gray-200">{profile.position}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <div className="flex-1">
                                <p className="text-gray-300 text-xs mb-1">ID компании</p>
                                <p className="text-sm text-gray-200">{profile.companyId}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <div className="flex-1">
                                <p className="text-gray-300 text-xs mb-1">Название компании</p>
                                <p className="text-sm text-gray-200">{profile.companyName}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {profile.active ? (
                                <CheckCircle2 className="h-4 w-4 text-green-400" />
                            ) : (
                                <XCircle className="h-4 w-4 text-red-400" />
                            )}
                            <div className="flex-1">
                                <p className="text-gray-300 text-xs mb-1">Статус</p>
                                <Badge 
                                    variant={profile.active ? "default" : "destructive"} 
                                    className="text-xs"
                                >
                                    {profile.active ? 'Активен' : 'Неактивен'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}