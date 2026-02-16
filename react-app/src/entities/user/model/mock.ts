import { type ProfileCardType } from "./types";

export const mockProfile: ProfileCardType[] = [
  {
    id: 1001,
    email: "bektur@example.com",
    role: "MANAGER",
    position: "Менеджер проектов",
    companyId: 1,
    companyName: "ООО СтройКомпания",
    active: true,
    name: "Бектур",
    username: "bektur_kg",
    photo: "https://i.pravatar.cc/150?img=52"
  },
  {
    id: 1002,
    email: "aizhan@example.com",
    role: "EMPLOYEE",
    position: "Инженер",
    companyId: 1,
    companyName: "ООО СтройКомпания",
    active: true,
    name: "Айжан",
    username: "aizhan_05",
    photo: "https://i.pravatar.cc/150?img=45"
  },
  {
    id: 1003,
    email: "erlan@example.com",
    role: "ADMIN",
    position: "Администратор системы",
    companyId: 1,
    companyName: "ООО СтройКомпания",
    active: true,
    name: "Эрлан",
    username: "erlan_dev",
    photo: "https://i.pravatar.cc/150?img=33"
  },
  {
    id: 1004,
    email: "nurzada@example.com",
    role: "USER",
    position: "Сотрудник",
    companyId: 2,
    companyName: "АО Девелопмент",
    active: true,
    name: "Нурзада",
    username: "nurzada.m",
    photo: "https://i.pravatar.cc/150?img=52"
  },
  {
    id: 1005,
    email: "kubat@example.com",
    role: "EMPLOYEE",
    position: "Прораб",
    companyId: 1,
    companyName: "ООО СтройКомпания",
    active: false,
    name: "Кубат",
    username: "kubat_alatoo",
    photo: "https://i.pravatar.cc/150?img=19"
  },
  {
    id: 1006,
    email: "aigerim@example.com",
    role: "MANAGER",
    position: "Менеджер по качеству",
    companyId: 2,
    companyName: "АО Девелопмент",
    active: true,
    name: "Айгерим",
    username: "aigerim_ui",
    photo: "https://i.pravatar.cc/150?img=67"
  },
  {
    id: 1007,
    email: "mirbek@example.com",
    role: "USER",
    position: "Сотрудник",
    companyId: 1,
    companyName: "ООО СтройКомпания",
    active: true,
    name: "Мирбек",
    username: "mirbek_kgz",
    photo: "https://i.pravatar.cc/150?img=41"
  },
  {
    id: 1008,
    email: "sabina@example.com",
    role: "EMPLOYEE",
    position: "Бухгалтер",
    companyId: 2,
    companyName: "АО Девелопмент",
    active: true,
    name: "Сабина",
    username: "sabina_kant",
    photo: "https://i.pravatar.cc/150?img=29"
  },
  {
    id: 1009,
    email: "talant@example.com",
    role: "ADMIN",
    position: "Системный администратор",
    companyId: 1,
    companyName: "ООО СтройКомпания",
    active: true,
    name: "Талант",
    username: "talant_code",
    photo: "https://i.pravatar.cc/150?img=12"
  },
  {
    id: 1010,
    email: "dinara@example.com",
    role: "USER",
    position: "Сотрудник",
    companyId: 2,
    companyName: "АО Девелопмент",
    active: false,
    name: "Динара",
    username: "dinara_travel",
    photo: "https://i.pravatar.cc/150?img=58"
  }
] as const;