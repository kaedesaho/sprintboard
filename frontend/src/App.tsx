import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar'
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import MyProjects from './pages/MyProjects';
import Settings from './pages/Settings';
import ProjectLayout from './pages/ProjectLayout';
import Tasks from './pages/Tasks';
import ProjectOverview from './pages/ProjectOverview';
import ProjectForm from './pages/ProjectForm';
import TaskPage from './pages/TaskPage';
import Notes from './pages/Notes';
import NotePage from './pages/NotePage';
import ProjectMembers from './pages/ProjectMembers';
import ProjectSettings from './pages/ProjectSettings';
import './App.css'

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <ThemeProvider>
          <BrowserRouter>
            <div className="app-layout">
              <Sidebar />
              <div className="app-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/dashboard" element={<MyProjects />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path='/create-project' element={<ProjectForm mode="create" />} />

                  <Route path='/projects/:projectID' element={<ProjectLayout />}>
                    <Route index element={<ProjectOverview />} />
                    <Route path='tasks' element={<Tasks />} />
                    <Route path='tasks/create' element={<TaskPage mode="create"/>} />
                    <Route path='tasks/:taskID' element={<TaskPage mode="edit"/>} />
                    <Route path='notes' element={<Notes />} />
                    <Route path='notes/:noteId' element={<NotePage />} />
                    <Route path='members' element={<ProjectMembers />} />
                    <Route path='settings' element={<ProjectSettings />} />
                    <Route path='user-settings' element={<Settings />} />
                  </Route>
                </Routes>
              </div>
            </div>
          </BrowserRouter>
        </ThemeProvider>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App
