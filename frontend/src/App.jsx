import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toast'
import Home from './pages/Home'
import Login from './pages/Login'
import Repositories from './pages/Repositories'
import ImportRepository from './pages/ImportRepository'
import RepositoryShell from './pages/RepositoryShell'
import RepositoryOverview from './pages/RepositoryOverview'
import Architecture from './pages/Architecture'
import Files from './pages/Files'
import Dependencies from './pages/Dependencies'
import APIs from './pages/APIs'
import DatabasePage from './pages/DatabasePage'
import AuthenticationPage from './pages/AuthenticationPage'
import Setup from './pages/Setup'
import Deployment from './pages/Deployment'
import Chat from './pages/Chat'
import TraceFeature from './pages/TraceFeature'
import ChangeImpact from './pages/ChangeImpact'
import ProjectHealth from './pages/ProjectHealth'
import './App.css'

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Repositories list + import */}
          <Route path="/repositories" element={<Repositories />} />
          <Route path="/repositories/import" element={<ImportRepository />} />

          {/* Repository workspace — nested under AppShell */}
          <Route path="/repository/:repoId" element={<RepositoryShell />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview"      element={<RepositoryOverview />} />
            <Route path="architecture"  element={<Architecture />} />
            <Route path="files"         element={<Files />} />
            <Route path="dependencies"  element={<Dependencies />} />
            <Route path="apis"          element={<APIs />} />
            <Route path="database"      element={<DatabasePage />} />
            <Route path="authentication" element={<AuthenticationPage />} />
            <Route path="setup"         element={<Setup />} />
            <Route path="deployment"    element={<Deployment />} />
            <Route path="chat"          element={<Chat />} />
            <Route path="trace"         element={<TraceFeature />} />
            <Route path="impact"        element={<ChangeImpact />} />
            <Route path="health"        element={<ProjectHealth />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}
