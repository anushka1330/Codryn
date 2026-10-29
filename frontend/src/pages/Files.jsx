import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { FolderTree, FileCode2, Loader2, AlertCircle } from 'lucide-react'
import Editor from '@monaco-editor/react'
import FileTree from '../components/ui/FileTree'
import repositoryService from '../services/repositoryService'
import styles from './Files.module.css'
import EmptyState from '../components/ui/EmptyState'

export default function Files() {
  const { repository } = useOutletContext() || {}
  const [files, setFiles] = useState([])
  const [loadingList, setLoadingList] = useState(true)
  const [errorList, setErrorList] = useState(null)

  const [selectedFile, setSelectedFile] = useState(null) // the node
  const [fileContent, setFileContent] = useState('')
  const [loadingContent, setLoadingContent] = useState(false)
  const [errorContent, setErrorContent] = useState(null)

  useEffect(() => {
    document.title = repository?.name ? `Codryn — ${repository.name} Files` : 'Codryn — Files'
  }, [repository])

  // Fetch list of files
  useEffect(() => {
    async function loadFiles() {
      if (!repository) return
      try {
        setLoadingList(true)
        const res = await repositoryService.listFiles(repository.id)
        setFiles(res.files || [])
      } catch (err) {
        setErrorList(err.message)
      } finally {
        setLoadingList(false)
      }
    }
    loadFiles()
  }, [repository])

  // Fetch content when file is selected
  useEffect(() => {
    async function loadContent() {
      if (!selectedFile || !selectedFile.fileData?.id) return
      try {
        setLoadingContent(true)
        setErrorContent(null)
        setFileContent('')
        const res = await repositoryService.getFile(repository.id, selectedFile.fileData.id)
        setFileContent(res.file?.content || '')
      } catch (err) {
        setErrorContent(err.message)
      } finally {
        setLoadingContent(false)
      }
    }
    loadContent()
  }, [selectedFile, repository])

  if (!repository) return null

  // Determine Monaco language based on extension
  const getLanguage = (ext) => {
    if (!ext) return 'plaintext'
    const map = {
      '.js': 'javascript', '.jsx': 'javascript', '.mjs': 'javascript',
      '.ts': 'typescript', '.tsx': 'typescript',
      '.py': 'python',
      '.go': 'go',
      '.rs': 'rust',
      '.java': 'java',
      '.c': 'c', '.cpp': 'cpp', '.h': 'c', '.hpp': 'cpp',
      '.cs': 'csharp',
      '.css': 'css', '.scss': 'scss', '.sass': 'scss',
      '.html': 'html', '.htm': 'html',
      '.json': 'json',
      '.xml': 'xml',
      '.yaml': 'yaml', '.yml': 'yaml',
      '.md': 'markdown',
      '.sql': 'sql',
      '.sh': 'shell', '.bash': 'shell'
    }
    return map[ext.toLowerCase()] || 'plaintext'
  }

  return (
    <div className={styles.page}>
      {/* Sidebar - File Tree */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <FolderTree size={16} className={styles.headerIcon} />
          <span>Explorer</span>
        </div>
        <div className={styles.treeContainer}>
          {loadingList ? (
            <div className={styles.loadingBox}>
              <Loader2 size={16} className={styles.spinner} />
              <span>Loading files...</span>
            </div>
          ) : errorList ? (
            <div className={styles.errorBox}>
              <AlertCircle size={16} />
              <span>{errorList}</span>
            </div>
          ) : (
            <FileTree 
              files={files} 
              onSelectFile={setSelectedFile} 
              selectedPath={selectedFile?.path} 
            />
          )}
        </div>
      </div>

      {/* Main Content - Code Editor */}
      <div className={styles.main}>
        {selectedFile ? (
          <div className={styles.editorContainer}>
            <div className={styles.editorHeader}>
              <FileCode2 size={15} className={styles.editorIcon} />
              <span className={styles.editorPath}>{selectedFile.path}</span>
            </div>
            <div className={styles.editorWrapper}>
              {loadingContent ? (
                <div className={styles.loadingBoxMain}>
                  <Loader2 size={24} className={styles.spinner} />
                  <span>Loading content...</span>
                </div>
              ) : errorContent ? (
                <div className={styles.errorBoxMain}>
                  <AlertCircle size={24} />
                  <span>{errorContent}</span>
                </div>
              ) : (
                <Editor
                  height="100%"
                  language={getLanguage(selectedFile.fileData?.extension)}
                  theme={localStorage.getItem('codryn_editor_theme') || 'vs-dark'}
                  value={fileContent}
                  options={{
                    readOnly: true,
                    minimap: { enabled: localStorage.getItem('codryn_editor_minimap') === 'true' },
                    fontSize: parseInt(localStorage.getItem('codryn_editor_font_size') || '14', 10),
                    wordWrap: localStorage.getItem('codryn_editor_word_wrap') || 'on',
                    scrollBeyondLastLine: false,
                    padding: { top: 16 }
                  }}
                  loading={
                    <div className={styles.loadingBoxMain}>
                      <Loader2 size={24} className={styles.spinner} />
                      <span>Loading editor...</span>
                    </div>
                  }
                />
              )}
            </div>
          </div>
        ) : (
          <div className={styles.emptyStateContainer}>
            <EmptyState
              icon={<FileCode2 size={24} />}
              title="No file selected"
              description="Select a file from the explorer to view its contents."
            />
          </div>
        )}
      </div>
    </div>
  )
}
