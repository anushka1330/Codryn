import { Network } from 'lucide-react'
import EmptyState from '../components/ui/EmptyState'
export default function Dependencies() {
  return <div><h2 style={{fontWeight:700,marginBottom:'var(--space-4)'}}>Dependencies</h2>
    <EmptyState icon={<Network size={22}/>} title="Dependencies" description="Package dependencies detected from repository files. Run analysis to populate." />
  </div>
}
