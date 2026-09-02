import { Terminal } from 'lucide-react'
import EmptyState from '../components/ui/EmptyState'
export default function Setup() {
  return <div><h2 style={{fontWeight:700,marginBottom:'var(--space-4)'}}>Setup Guide</h2>
    <EmptyState icon={<Terminal size={22}/>} title="Setup Instructions" description="AI-generated setup instructions for this repository. Run analysis to populate." />
  </div>
}
