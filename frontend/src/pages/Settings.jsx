import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Code2, Compass, Check, RotateCcw } from 'lucide-react'
import Logo from '../components/ui/Logo'
import Button from '../components/ui/Button'
import { useToast } from '../components/ui/Toast'
import styles from './Settings.module.css'

export default function Settings() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [editorTheme, setEditorTheme] = useState(() => localStorage.getItem('codryn_editor_theme') || 'vs-dark')
  const [editorFontSize, setEditorFontSize] = useState(() => localStorage.getItem('codryn_editor_font_size') || '13')
  const [editorMinimap, setEditorMinimap] = useState(() => localStorage.getItem('codryn_editor_minimap') !== 'false')
  const [editorWordWrap, setEditorWordWrap] = useState(() => localStorage.getItem('codryn_editor_word_wrap') === 'on')
  const [defaultTab, setDefaultTab] = useState(() => localStorage.getItem('codryn_default_tab') || 'overview')

  useEffect(() => {
    document.title = 'Codryn — Settings'
  }, [])

  const handleSave = () => {
    localStorage.setItem('codryn_editor_theme', editorTheme)
    localStorage.setItem('codryn_editor_font_size', editorFontSize)
    localStorage.setItem('codryn_editor_minimap', String(editorMinimap))
    localStorage.setItem('codryn_editor_word_wrap', editorWordWrap ? 'on' : 'off')
    localStorage.setItem('codryn_default_tab', defaultTab)
    toast('Preferences saved successfully!', 'success')
  }

  const handleReset = () => {
    setEditorTheme('vs-dark')
    setEditorFontSize('13')
    setEditorMinimap(true)
    setEditorWordWrap(false)
    setDefaultTab('overview')
    localStorage.removeItem('codryn_editor_theme')
    localStorage.removeItem('codryn_editor_font_size')
    localStorage.removeItem('codryn_editor_minimap')
    localStorage.removeItem('codryn_editor_word_wrap')
    localStorage.removeItem('codryn_default_tab')
    toast('Settings reset to default values.', 'info')
  }

  return (
    <div className={styles.page}>
      <div className={styles.topNav}>
        <Logo to="/" size="sm" />
        <Button variant="ghost" size="sm" onClick={() => navigate('/repositories')}>
          Repositories
        </Button>
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>Application Settings</h1>
        <p className={styles.subtitle}>
          Configure your workspace preferences, code editor display, and default navigation.
        </p>
      </div>

      {/* Editor Preferences */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <Code2 size={18} /> Monaco Code Editor
          </h2>
          <p className={styles.sectionDesc}>Customize the file browser syntax viewer</p>
        </div>

        <div className={styles.settingRow}>
          <div className={styles.settingLabel}>
            <span className={styles.settingName}>Editor Theme</span>
            <span className={styles.settingHint}>Color theme applied to source code in the explorer</span>
          </div>
          <select
            className={styles.select}
            value={editorTheme}
            onChange={e => setEditorTheme(e.target.value)}
            id="setting-editor-theme"
          >
            <option value="vs-dark">Dark (Default)</option>
            <option value="vs">Light</option>
            <option value="hc-black">High Contrast</option>
          </select>
        </div>

        <div className={styles.settingRow}>
          <div className={styles.settingLabel}>
            <span className={styles.settingName}>Font Size</span>
            <span className={styles.settingHint}>Text size for code lines in pixels</span>
          </div>
          <select
            className={styles.select}
            value={editorFontSize}
            onChange={e => setEditorFontSize(e.target.value)}
            id="setting-editor-font-size"
          >
            <option value="12">12 px (Compact)</option>
            <option value="13">13 px (Default)</option>
            <option value="14">14 px (Medium)</option>
            <option value="16">16 px (Large)</option>
          </select>
        </div>

        <div className={styles.settingRow}>
          <div className={styles.settingLabel}>
            <span className={styles.settingName}>Code Minimap</span>
            <span className={styles.settingHint}>Overview minimap column on the right edge of editor</span>
          </div>
          <button
            type="button"
            className={`${styles.toggleBtn} ${editorMinimap ? styles.toggleBtnActive : ''}`}
            onClick={() => setEditorMinimap(!editorMinimap)}
            id="setting-editor-minimap-toggle"
          >
            {editorMinimap ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        <div className={styles.settingRow}>
          <div className={styles.settingLabel}>
            <span className={styles.settingName}>Word Wrap</span>
            <span className={styles.settingHint}>Wrap long code lines instead of horizontal scrolling</span>
          </div>
          <button
            type="button"
            className={`${styles.toggleBtn} ${editorWordWrap ? styles.toggleBtnActive : ''}`}
            onClick={() => setEditorWordWrap(!editorWordWrap)}
            id="setting-editor-wordwrap-toggle"
          >
            {editorWordWrap ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      {/* Navigation Preferences */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <Compass size={18} /> Workspace Navigation
          </h2>
          <p className={styles.sectionDesc}>Default starting view when opening an analyzed repository</p>
        </div>

        <div className={styles.settingRow}>
          <div className={styles.settingLabel}>
            <span className={styles.settingName}>Default Repository Tab</span>
            <span className={styles.settingHint}>Landing page when clicking into a repository</span>
          </div>
          <select
            className={styles.select}
            value={defaultTab}
            onChange={e => setDefaultTab(e.target.value)}
            id="setting-default-tab"
          >
            <option value="overview">Overview</option>
            <option value="architecture">Architecture X-Ray</option>
            <option value="files">Files & Explorer</option>
            <option value="chat">AI Chat</option>
          </select>
        </div>
      </div>

      <div className={styles.actions}>
        <Button onClick={handleSave} icon={<Check size={16} />} id="settings-save-btn">
          Save Preferences
        </Button>
        <Button variant="secondary" onClick={handleReset} icon={<RotateCcw size={14} />} id="settings-reset-btn">
          Reset to Defaults
        </Button>
      </div>
    </div>
  )
}
