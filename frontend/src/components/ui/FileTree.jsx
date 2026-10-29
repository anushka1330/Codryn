import { useState, useMemo } from 'react'
import { Folder, FolderOpen, FileCode2, ChevronRight, ChevronDown } from 'lucide-react'
import styles from './FileTree.module.css'

function FileNode({ node, level = 0, onSelectFile, selectedPath }) {
  const [isOpen, setIsOpen] = useState(level < 1) // auto open root level
  const isDir = node.type === 'tree'
  const isSelected = selectedPath === node.path

  const handleToggle = (e) => {
    e.stopPropagation()
    if (isDir) setIsOpen(!isOpen)
    else onSelectFile(node)
  }

  const iconSize = 14

  return (
    <div className={styles.nodeWrapper}>
      <div
        className={`${styles.node} ${isSelected ? styles.selected : ''}`}
        style={{ paddingLeft: `${level * 12 + 4}px` }}
        onClick={handleToggle}
      >
        {isDir ? (
          <span className={styles.arrow}>
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        ) : (
          <span className={styles.spacer} />
        )}
        
        <span className={styles.icon}>
          {isDir ? (
            isOpen ? <FolderOpen size={iconSize} className={styles.folderIcon} /> : <Folder size={iconSize} className={styles.folderIcon} />
          ) : (
            <FileCode2 size={iconSize} className={styles.fileIcon} />
          )}
        </span>
        <span className={styles.name}>{node.name}</span>
      </div>

      {isDir && isOpen && node.children && (
        <div className={styles.children}>
          {node.children.map(child => (
            <FileNode
              key={child.path}
              node={child}
              level={level + 1}
              onSelectFile={onSelectFile}
              selectedPath={selectedPath}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function FileTree({ files, onSelectFile, selectedPath }) {
  const tree = useMemo(() => {
    if (!files || !files.length) return { name: 'root', type: 'tree', children: [] }

    const root = { name: 'root', path: '', type: 'tree', children: [] }
    const lookup = { '': root }

    // Ensure sorting by path
    const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path))

    for (const file of sortedFiles) {
      const parts = file.path.split('/')
      let currentPath = ''
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        const parentPath = currentPath
        currentPath = currentPath ? `${currentPath}/${part}` : part
        
        if (!lookup[currentPath]) {
          const isFile = i === parts.length - 1
          const node = {
            name: part,
            path: currentPath,
            type: isFile ? 'blob' : 'tree',
            fileData: isFile ? file : null,
            children: isFile ? null : []
          }
          lookup[currentPath] = node
          lookup[parentPath].children.push(node)
        }
      }
    }

    // Sort children: directories first, then files alphabetically
    const sortNode = (node) => {
      if (node.children) {
        node.children.sort((a, b) => {
          if (a.type !== b.type) return a.type === 'tree' ? -1 : 1
          return a.name.localeCompare(b.name)
        })
        node.children.forEach(sortNode)
      }
    }
    sortNode(root)

    return root
  }, [files])

  if (!files || !files.length) {
    return <div className={styles.empty}>No files found</div>
  }

  return (
    <div className={styles.container}>
      {tree.children.map(child => (
        <FileNode
          key={child.path}
          node={child}
          level={0}
          onSelectFile={onSelectFile}
          selectedPath={selectedPath}
        />
      ))}
    </div>
  )
}
