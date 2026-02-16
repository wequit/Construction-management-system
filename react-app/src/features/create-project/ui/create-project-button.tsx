import { Plus } from "lucide-react"

interface CreateProjectButtonProps {
  onClick?: () => void
}

export const CreateProjectButton = ({ onClick }: CreateProjectButtonProps) => {
  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-20">
      <button 
        onClick={onClick}
        className="w-14 h-14 md:w-16 md:h-16 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg flex items-center justify-center "
      >
        <Plus className="w-6 h-6 md:w-7 md:h-7" />
      </button>
    </div>
  )
}

