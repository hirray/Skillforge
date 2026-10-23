import { Routes, Route } from 'react-router-dom';
import ProjectsList from './ProjectsList';
import CreateProject from './CreateProject';
import ProjectDetail from './ProjectDetail';

const ProjectsModule = () => {
  return (
    <Routes>
      <Route path="/" element={<ProjectsList />} />
      <Route path="/create" element={<CreateProject />} />
      <Route path="/new" element={<CreateProject />} />
      <Route path="/:id" element={<ProjectDetail />} />
    </Routes>
  );
};

export default ProjectsModule;
