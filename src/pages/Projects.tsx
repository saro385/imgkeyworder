import { useState } from "react";
import { Plus, Folder, Edit2, Trash2, MoreVertical } from "lucide-react"; // Removed Settings import
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Project } from "@/types";
import { toast } from "sonner";
import { SettingsMenu } from "@/components/settings/SettingsMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const Projects = () => {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem("projects");
    return saved ? JSON.parse(saved) : [];
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProjectName.trim()) {
      toast.error("Enter project name");
      return;
    }

    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName.trim(),
      createdAt: new Date().toISOString(),
      images: []
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    localStorage.setItem("projects", JSON.stringify(updatedProjects));

    setNewProjectName("");
    setIsCreateDialogOpen(false);
    toast.success("Project created");
  };

  const handleEditProject = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingProject || !editingProject.name.trim()) {
      toast.error("Enter project name");
      return;
    }

    const updatedProjects = projects.map(p =>
      p.id === editingProject.id ? editingProject : p
    );

    setProjects(updatedProjects);
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
    setIsEditDialogOpen(false);
    setEditingProject(null);
    toast.success("Project updated");
  };

  const handleDeleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
    toast.success("Project deleted");
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  // const handleSettingsClick = (projectId: string, event: React.MouseEvent) => { // Removed
  //   event.stopPropagation(); // Prevent card click
  //   navigate(`/project/${projectId}/settings`); // Navigate to project-specific settings
  // };


  const handleLogout = () => {
    localStorage.removeItem("license_authenticated");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">IMG Keyworder</h1>
            <p className="text-gray-600 mt-2">Manage your image metadata using AI</p>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
            <SettingsMenu
              onSelectOption={() => navigate("/settings")}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="p-6 glass-panel hover:shadow-lg transition-shadow relative group cursor-pointer"
              onClick={() => handleProjectClick(project.id)}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Folder className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{project.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {project.images.length} images
                  </p>
                </div>
              </div>
              {/* Settings button removed from here */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProject(project);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id)
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Card>
          ))}
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <Input
                placeholder="Enter project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
              <Button type="submit" className="w-full">
                Create Project
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditProject} className="space-y-4">
              <Input
                placeholder="Enter project name"
                value={editingProject?.name || ""}
                onChange={(e) => setEditingProject(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
              <Button type="submit" className="w-full">
                Save Changes
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Projects;
