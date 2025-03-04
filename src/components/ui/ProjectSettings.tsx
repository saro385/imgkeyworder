import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Project } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from './sidebar';

const ProjectSettings = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const projects: Project[] = JSON.parse(localStorage.getItem('projects') || '[]');
    const currentProject = projects.find((p) => p.id === id);
    if (!currentProject) {
      toast.error('Project not found');
      navigate('/projects');
      return;
    }
    setProject(currentProject);
  }, [id, navigate]);

  const handleUpdateProjectName = (newName: string) => {
    if (!project) return;

    const updatedProject: Project = { ...project, name: newName };
    const projects: Project[] = JSON.parse(localStorage.getItem('projects') || '[]');
    const updatedProjects = projects.map((p) => (p.id === project.id ? updatedProject : p));
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    setProject(updatedProject);
    toast.success('Project name updated');
  };

  if (!project) {
    return null; // Or a loading indicator
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-8">
      <Sidebar>
        <SidebarContent>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate(`/project/${id}`)}>
                  Back to Project
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
        </SidebarContent>
      </Sidebar>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">Project Settings: {project.name}</h1>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Project Name</label>
            <Input
              value={project.name}
              onChange={(e) => handleUpdateProjectName(e.target.value)}
              placeholder="Enter new project name"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettings;
