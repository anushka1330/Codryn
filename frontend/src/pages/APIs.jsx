import { Server } from 'lucide-react'
import EmptyState from '../components/ui/EmptyState'
export default function APIs() {
  return <div><h2 style={{fontWeight:700,marginBottom:'var(--space-4)'}}>APIs</h2>
    <EmptyState icon={<Server size={22}/>} title="APIs" description="Detected API routes and endpoints. Run analysis to populate." />
  </div>
}
