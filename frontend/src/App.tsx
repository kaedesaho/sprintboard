import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import Navbar from './components/Navbar'
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import ProjectLayout from './pages/ProjectLayout';
import Tasks from './pages/Tasks';
import ProjectOverview from './pages/ProjectOverview';
import ProjectForm from './pages/ProjectForm';
import TaskPage from './pages/TaskPage';
import Notes from './pages/Notes';
import NotePage from './pages/NotePage';
import ProjectMembers from './pages/ProjectMembers';
import './App.css'

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path='/create-project' element={<ProjectForm mode="create" />} />

          <Route path='/projects/:projectID' element={<ProjectLayout />}>
            <Route index element={<ProjectOverview />} />
            <Route path='tasks' element={<Tasks />} />
            <Route path='notes' element={<Notes />} />
            <Route path='notes/:noteId' element={<NotePage />} />
            <Route path='members' element={<ProjectMembers />} />
          </Route>

          {/* Standalone pages — no sub-nav */}
          <Route path='/projects/:projectID/edit' element={<ProjectForm mode="edit" />} />
          <Route path='/projects/:projectID/tasks/create' element={<TaskPage mode="create"/>} />
          <Route path='/projects/:projectID/tasks/:taskID' element={<TaskPage mode="edit"/>} />
        </Routes>
      </BrowserRouter>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App
