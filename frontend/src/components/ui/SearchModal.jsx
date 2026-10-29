import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, FolderGit2, FileCode2, Compass, Loader2, X } from 'lucide-react'
import styles from './SearchModal.module.css'

export default function SearchModal({ isOpen, onClose, currentRepository }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [query, setQuery] = useState('')
  const [repositories, setRepositories] = useState([])
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Load repositories and files for search
  useEffect(() => {
    if (!isOpen) return
    setLoading(true)

    const repoPromise = fetch('/api/repositories')
      .then(r => r.json())
      .then(d => setRepositories(d.repositories || []))
      .catch(() => {})

    const filePromise = currentRepository?.id
      ? fetch(`/api/repositories/${currentRepository.id}/files`)
          .then(r => r.json())
          .then(d => setFiles(d.files || []))
          .catch(() => {})
      : Promise.resolve()

    Promise.all([repoPromise, filePromise]).finally(() => setLoading(false))
  }, [isOpen, currentRepository])

  // Global key listener for Ctrl+K and Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else onClose(true) // trigger open
      }
      if (isOpen && e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Pages available in workspace
  const workspacePages = currentRepository?.id
    ? [
        { title: 'Overview', path: `/repository/${currentRepository.id}/overview`, type: 'Page' },
        { title: 'Architecture X-Ray', path: `/repository/${currentRepository.id}/architecture`, type: 'Page' },
        { title: 'Files & Code Explorer', path: `/repository/${currentRepository.id}/files`, type: 'Page' },
        { title: 'AI Chat', path: `/repository/${currentRepository.id}/chat`, type: 'Page' },
        { title: 'Trace Feature', path: `/repository/${currentRepository.id}/trace`, type: 'Page' },
        { title: 'Change Impact', path: `/repository/${currentRepository.id}/impact`, type: 'Page' },
        { title: 'Project Health', path: `/repository/${currentRepository.id}/health`, type: 'Page' },
        { title: 'Authentication', path: `/repository/${currentRepository.id}/authentication`, type: 'Page' },
        { title: 'APIs', path: `/repository/${currentRepository.id}/apis`, type: 'Page' },
        { title: 'Database', path: `/repository/${currentRepository.id}/database`, type: 'Page' },
        { title: 'Dependencies', path: `/repository/${currentRepository.id}/dependencies`, type: 'Page' },
        { title: 'Setup Guide', path: `/repository/${currentRepository.id}/setup`, type: 'Page' },
        { title: 'Deployment', path: `/repository/${currentRepository.id}/deployment`, type: 'Page' },
      ]
    : []

  const q = query.trim().toLowerCase()

  // Filter items
  const matchedRepos = repositories
    .filter(r => r.full_name?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q))
    .slice(0, 4)
    .map(r => ({
      id: `repo-${r.id}`,
      title: r.full_name,
      subtitle: r.description || 'Repository',
      type: 'Repository',
      icon: <FolderGit2 size={16} />,
      action: () => { navigate(`/repository/${r.id}/overview`); onClose(); }
    }))

  const matchedFiles = files
    .filter(f => f.path?.toLowerCase().includes(q) || f.name?.toLowerCase().includes(q))
    .slice(0, 6)
    .map(f => ({
      id: `file-${f.id}`,
      title: f.path,
      subtitle: `${f.language || 'Code'} · ${f.size} bytes`,
      type: 'File',
      icon: <FileCode2 size={16} />,
      action: () => { navigate(`/repository/${currentRepository.id}/files?path=${encodeURIComponent(f.path)}`); onClose(); }
    }))

  const matchedPages = workspacePages
    .filter(p => p.title.toLowerCase().includes(q))
    .slice(0, 4)
    .map(p => ({
      id: `page-${p.title}`,
      title: p.title,
      subtitle: `Section in ${currentRepository?.name || 'repository'}`,
      type: 'Page',
      icon: <Compass size={16} />,
      action: () => { navigate(p.path); onClose(); }
    }))

  const results = q ? [...matchedPages, ...matchedFiles, ...matchedRepos] : [...matchedPages.slice(0, 3), ...matchedRepos.slice(0, 3)]

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => (i + 1) % Math.max(results.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => (i - 1 + results.length) % Math.max(results.length, 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[activeIndex]) {
        results[activeIndex].action()
      }
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose} id="search-modal-overlay">
      <div className={styles.modal} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={styles.inputWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder={currentRepository ? `Search files, sections, or codebases...` : `Search repositories...`}
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
            onKeyDown={handleKeyDown}
            id="spotlight-search-input"
          />
          {loading ? (
            <Loader2 size={16} className={styles.searchIcon} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              aria-label="Close search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {results.length > 0 ? (
          <ul className={styles.resultsList} role="listbox">
            {results.map((item, idx) => (
              <li
                key={item.id}
                className={`${styles.resultItem} ${idx === activeIndex ? styles.resultItemActive : ''}`}
                onClick={item.action}
                onMouseEnter={() => setActiveIndex(idx)}
                role="option"
                aria-selected={idx === activeIndex}
              >
                <div className={styles.resultIcon}>{item.icon}</div>
                <div className={styles.resultInfo}>
                  <span className={styles.resultTitle}>{item.title}</span>
                  <span className={styles.resultSubtitle}>{item.subtitle}</span>
                </div>
                <span className={styles.resultType}>{item.type}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.emptyState}>
            No results matching "{query}"
          </div>
        )}

        <div className={styles.footer}>
          <div className={styles.footerHints}>
            <span><span className={styles.kbd}>↑</span> <span className={styles.kbd}>↓</span> navigate</span>
            <span><span className={styles.kbd}>↵</span> open</span>
            <span><span className={styles.kbd}>esc</span> close</span>
          </div>
          <span>Codryn Search</span>
        </div>
      </div>
    </div>
  )
}
