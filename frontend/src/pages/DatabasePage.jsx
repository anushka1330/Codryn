import { Database } from 'lucide-react'
import EmptyState from '../components/ui/EmptyState'
export default function DatabasePage() {
  return <div><h2 style={{fontWeight:700,marginBottom:'var(--space-4)'}}>Database</h2>
    <EmptyState icon={<Database size={22}/>} title="Database" description="Detected database models, schemas and relationships. Run analysis to populate." />
  </div>
}
