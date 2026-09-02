import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  GitBranch, Layers, MessageSquare, Zap, Search, Shield,
  ArrowRight, ChevronRight, Code2, Database,
  Network, FileCode2, Users, Sparkles, Terminal
} from 'lucide-react'
import Button from '../components/ui/Button'
import styles from './Home.module.css'

const FEATURES = [
  {
    icon: <Layers size={20} />,
    title: 'Architecture X-Ray',
    description: 'Visualize how your codebase is structured — frontend, backend, services, database, and external integrations on a single interactive canvas.',
  },
  {
    icon: <Zap size={20} />,
    title: 'Trace a Feature',
    description: 'Ask "How does login work?" and Codryn maps the complete flow — from UI component to API route to database query.',
  },
  {
    icon: <MessageSquare size={20} />,
    title: 'AI Repository Chat',
    description: 'Ask anything about your codebase. Get grounded answers with references to actual files and functions, never hallucinated.',
  },
  {
    icon: <Network size={20} />,
    title: 'Change Impact',
    description: 'Select any file or function and see what directly depends on it — before you make a change that breaks production.',
  },
  {
    icon: <Search size={20} />,
    title: 'Code Explorer',
    description: 'Browse files with syntax highlighting, search across the repository, and get AI explanation of any function inline.',
  },
  {
    icon: <Users size={20} />,
    title: 'New Developer Mode',
    description: 'Guided onboarding that walks new contributors through architecture, auth, database, and key flows in the right order.',
  },
]

const STEPS = [
  {
    number: '01',
    icon: <GitBranch size={22} />,
    title: 'Connect',
    description: 'Paste any public or private GitHub repository URL.',
  },
  {
    number: '02',
    icon: <Sparkles size={22} />,
    title: 'Analyze',
    description: 'Codryn imports and analyzes structure, dependencies, APIs, and architecture.',
  },
  {
    number: '03',
    icon: <Layers size={22} />,
    title: 'Understand',
    description: 'Explore your codebase through interactive visualizations, AI chat, and guided tours.',
  },
]

const MOCK_FILES = [
  { name: 'src/', type: 'dir', depth: 0 },
  { name: 'app/', type: 'dir', depth: 1 },
  { name: 'page.tsx', type: 'file', depth: 2, ext: 'tsx' },
  { name: 'layout.tsx', type: 'file', depth: 2, ext: 'tsx' },
  { name: 'components/', type: 'dir', depth: 1 },
  { name: 'Button.tsx', type: 'file', depth: 2, ext: 'tsx' },
  { name: 'Sidebar.tsx', type: 'file', depth: 2, ext: 'tsx', active: true },
  { name: 'services/', type: 'dir', depth: 1 },
  { name: 'api.ts', type: 'file', depth: 2, ext: 'ts' },
]

const MOCK_CODE_LINES = [
  { n: 1,  t: '', c: 'import' },
  { n: 2,  t: 'keyword', c: 'import' },
  { n: 3,  t: '',  c: '' },
  { n: 4,  t: 'comment', c: '// Repository sidebar navigation' },
  { n: 5,  t: 'keyword', c: 'export default function' },
  { n: 6,  t: '',  c: '  const [collapsed, setCollapsed] =' },
  { n: 7,  t: '',  c: '    useState(false)' },
  { n: 8,  t: '',  c: '' },
  { n: 9,  t: 'keyword', c: '  return (' },
  { n: 10, t: '',  c: '    <aside className={styles.sidebar}>' },
]

function CodePreview() {
  return (
    <div className={styles.codePreview}>
      <div className={styles.codeHeader}>
        <span className={styles.dot} style={{background:'#ef4444'}} />
        <span className={styles.dot} style={{background:'#f59e0b'}} />
        <span className={styles.dot} style={{background:'#10b981'}} />
        <span className={styles.fileName}>Sidebar.tsx</span>
        <span className={styles.aiTag}><Sparkles size={10} /> AI Analyzed</span>
      </div>
      <div className={styles.codePanels}>
        <div className={styles.fileTree}>
          {MOCK_FILES.map((f, i) => (
            <div
              key={i}
              className={`${styles.fileRow} ${f.active ? styles.fileRowActive : ''}`}
              style={{ paddingLeft: `${8 + f.depth * 14}px` }}
            >
              {f.type === 'dir'
                ? <ChevronRight size={11} className={styles.chevron} />
                : <FileCode2 size={11} className={styles.fileIcon} />
              }
              <span className={f.type === 'dir' ? styles.dirName : styles.fileName2}>
                {f.name}
              </span>
            </div>
          ))}
        </div>
        <div className={styles.codeLines}>
          {MOCK_CODE_LINES.map((line) => (
            <div key={line.n} className={styles.codeLine}>
              <span className={styles.lineNum}>{line.n}</span>
              <span className={`${styles.lineContent} ${line.t ? styles[`token--${line.t}`] : ''}`}>
                {line.c}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.analysisBar}>
        <div className={styles.analysisItem}>
          <div className={styles.analysisDot} style={{background:'var(--success)'}} />
          <span>React + TypeScript</span>
        </div>
        <div className={styles.analysisItem}>
          <div className={styles.analysisDot} style={{background:'var(--accent)'}} />
          <span>12 components</span>
        </div>
        <div className={styles.analysisItem}>
          <div className={styles.analysisDot} style={{background:'var(--info)'}} />
          <span>3 dependencies</span>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')

  function handleAnalyze(e) {
    e.preventDefault()
    if (url.trim()) {
      navigate(`/repositories/import?url=${encodeURIComponent(url.trim())}`)
    } else {
      navigate('/repositories/import')
    }
  }

  return (
    <div className={styles.landing}>
      {/* ── NAV ── */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.navLogo}>
            <Code2 size={20} className={styles.navLogoIcon} />
            <span>Codryn</span>
          </div>
          <div className={styles.navLinks}>
            <a href="#how-it-works">How it works</a>
            <a href="#features">Features</a>
            <a href="#preview">Preview</a>
          </div>
          <div className={styles.navActions}>
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign in</Button>
            <Button size="sm" onClick={() => navigate('/repositories/import')}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Sparkles size={12} />
            <span>AI-Powered Repository Intelligence</span>
          </div>

          <h1 className={styles.heroTitle}>
            <span className={styles.heroTitleMain}>Codryn</span>
            <span className={styles.heroSubtitle}>Understand any codebase.</span>
          </h1>

          <p className={styles.heroDesc}>
            Connect a GitHub repository and let AI explain its architecture, code flow,
            dependencies, APIs and behavior — in minutes, not weeks.
          </p>

          <form className={styles.heroForm} onSubmit={handleAnalyze}>
            <div className={styles.heroInput}>
              <GitBranch size={18} className={styles.heroInputIcon} />
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://github.com/owner/repository"
                className={styles.heroInputField}
                id="hero-repo-url"
              />
            </div>
            <Button type="submit" size="lg" id="hero-analyze-btn">
              Analyze Repository
              <ArrowRight size={16} />
            </Button>
          </form>

          <div className={styles.heroMeta}>
            <span>Public repositories · No installation required</span>
            <span className={styles.heroDivider}>·</span>
            <a href="#" onClick={e => { e.preventDefault(); navigate('/repositories/import?demo=true') }}>
              <GitBranch size={12} /> Explore demo
            </a>
          </div>
        </div>

        {/* Code preview floating */}
        <div className={styles.heroPreviewWrapper}>
          <CodePreview />
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className={styles.section} id="how-it-works">
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Process</div>
          <h2 className={styles.sectionTitle}>How Codryn works</h2>
          <p className={styles.sectionDesc}>
            Three steps from repository URL to deep codebase understanding.
          </p>

          <div className={styles.steps}>
            {STEPS.map((step, i) => (
              <div key={i} className={styles.step}>
                <div className={styles.stepNumber}>{step.number}</div>
                <div className={styles.stepIcon}>{step.icon}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.description}</p>
                {i < STEPS.length - 1 && (
                  <ArrowRight className={styles.stepArrow} size={18} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className={styles.section} id="features">
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Capabilities</div>
          <h2 className={styles.sectionTitle}>Everything you need to understand a codebase</h2>
          <p className={styles.sectionDesc}>
            Codryn is not a chatbot. It's an X-ray machine for your repository.
          </p>

          <div className={styles.featureGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCT PREVIEW ── */}
      <section className={styles.section} id="preview">
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Product</div>
          <h2 className={styles.sectionTitle}>The repository dashboard</h2>
          <p className={styles.sectionDesc}>
            A professional workspace purpose-built for codebase intelligence.
          </p>

          <div className={styles.dashboardPreview}>
            <div className={styles.dashSidebar}>
              <div className={styles.dashLogoRow}>
                <Code2 size={16} />
                <span className={styles.dashLogo}>Codryn</span>
              </div>
              <div className={styles.dashNav}>
                {['Overview','Architecture','Files','Dependencies','APIs','Database','Chat','Trace'].map((item, i) => (
                  <div key={i} className={`${styles.dashNavItem} ${i === 0 ? styles.dashNavItemActive : ''}`}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.dashMain}>
              <div className={styles.dashTopbar}>
                <div className={styles.dashRepo}>
                  <GitBranch size={14} />
                  <span>facebook / react</span>
                  <Badge variant="success">Analyzed</Badge>
                </div>
                <Terminal size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div className={styles.dashContent}>
                <div className={styles.dashStatRow}>
                  {[
                    { label: 'Files', value: '3,284', icon: <FileCode2 size={14} /> },
                    { label: 'Language', value: 'JavaScript', icon: <Code2 size={14} /> },
                    { label: 'Framework', value: 'React', icon: <Layers size={14} /> },
                    { label: 'Health', value: '91 / 100', icon: <Shield size={14} /> },
                  ].map((s, i) => (
                    <div key={i} className={styles.dashStat}>
                      <div className={styles.dashStatIcon}>{s.icon}</div>
                      <div>
                        <div className={styles.dashStatValue}>{s.value}</div>
                        <div className={styles.dashStatLabel}>{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.dashTechRow}>
                  {['JavaScript','React','Jest','Webpack','Rollup'].map((t, i) => (
                    <span key={i} className={styles.techPill}>{t}</span>
                  ))}
                </div>
                <div className={styles.dashArchRow}>
                  {['Frontend','Components','Hooks','API','Testing'].map((a, i) => (
                    <div key={i} className={styles.archPill}>
                      <div className={styles.archDot} />
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Ready to understand your codebase?</h2>
          <p className={styles.ctaDesc}>
            Paste a GitHub URL and get a complete AI-powered analysis in minutes.
          </p>
          <Button size="lg" onClick={() => navigate('/repositories/import')} id="cta-analyze-btn">
            Analyze a Repository
            <ArrowRight size={18} />
          </Button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLogo}>
            <Code2 size={16} />
            <span>Codryn</span>
          </div>
          <p className={styles.footerTagline}>Understand any codebase.</p>
        </div>
      </footer>
    </div>
  )
}

// Local Badge for preview (avoids import complexity for standalone use)
function Badge({ children, variant }) {
  const colors = {
    success: { background: 'var(--success-subtle)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.3)' },
    default: { background: 'var(--bg-overlay)', color: 'var(--text-secondary)', border: '1px solid var(--border)' },
  }
  const s = colors[variant] || colors.default
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 8px', borderRadius: '999px', fontSize: '0.7rem',
      fontWeight: 500, ...s
    }}>
      {children}
    </span>
  )
}
