import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GitBranch, Check } from 'lucide-react'
import { Database } from '@/lib/supabase/types'

type Branch = Database['public']['Tables']['branches']['Row']

interface BranchSelectorProps {
  branches: Branch[]
  currentBranch: Branch | null
  onSelectBranch: (branch: Branch) => void
}

export function BranchSelector({
  branches,
  currentBranch,
  onSelectBranch
}: BranchSelectorProps) {
  if (branches.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <GitBranch className="h-4 w-4" />
          <span className="hidden sm:inline">
            {currentBranch?.name || 'Select branch'}
          </span>
          {currentBranch?.is_main && (
            <Badge variant="secondary" className="ml-1 hidden sm:inline-flex">
              main
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {branches.map((branch) => (
          <DropdownMenuItem
            key={branch.id}
            onClick={() => onSelectBranch(branch)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              <span>{branch.name}</span>
              {branch.is_main && (
                <Badge variant="secondary" className="text-xs">
                  main
                </Badge>
              )}
            </div>
            {currentBranch?.id === branch.id && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
