import { Search } from "lucide-react"

interface ProjectSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export const ProjectSearch = ({ 
  value, 
  onChange, 
  placeholder = "Поиск..." 
}: ProjectSearchProps) => {
  return (
    <div className="relative flex-1 max-w-full md:max-w-md">
      <Search className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#1a2332] border border-gray-700 rounded-md pl-8 md:pl-10 pr-3 py-1.5 md:py-2 text-sm md:text-base placeholder:text-gray-500"
      />
    </div>
  )
}

