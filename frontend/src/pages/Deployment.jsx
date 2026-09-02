import { Rocket } from 'lucide-react'
import EmptyState from '../components/ui/EmptyState'
export default function Deployment() {
  return <div><h2 style={{fontWeight:700,marginBottom:'var(--space-4)'}}>Deployment</h2>
    <EmptyState icon={<Rocket size={22}/>} title="Deployment" description="Detected deployment configuration. Run analysis to populate." />
  </div>
}
