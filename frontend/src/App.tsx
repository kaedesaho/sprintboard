import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar'
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import ProjectHome from './pages/ProjectHome';
import ProjectForm from './pages/ProjectForm';
import TaskPage from './pages/TaskPage';
import './App.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path='/create-project' element={<ProjectForm mode="create" />} />
          <Route path='/projects/:projectID' element={<ProjectHome />} />
          <Route path='/projects/:projectID/edit' element={<ProjectForm mode="edit" />} />
          <Route path='/projects/:projectID/tasks/create' element={<TaskPage mode="create"/>} />
          <Route path='/projects/:projectID/tasks/:taskID' element={<TaskPage mode="edit"/>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App
