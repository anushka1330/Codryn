import { Shield } from 'lucide-react'
import EmptyState from '../components/ui/EmptyState'
export default function AuthenticationPage() {
  return <div><h2 style={{fontWeight:700,marginBottom:'var(--space-4)'}}>Authentication</h2>
    <EmptyState icon={<Shield size={22}/>} title="Authentication" description="Detected authentication patterns, providers and flows. Run analysis to populate." />
  </div>
}
