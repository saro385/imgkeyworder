import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Project, ProjectSettings as ProjectSettingsType } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_PROJECT_SETTINGS } from '@/config/constants';

const ProjectSettings = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [settings, setSettings] = useState<ProjectSettingsType>(DEFAULT_PROJECT_SETTINGS);

  // Load project
  useEffect(() => {
    const projects: Project[] = JSON.parse(localStorage.getItem('projects') || '[]');
    const currentProject = projects.find((p) => p.id === id);
    if (!currentProject) {
      toast.error('Project not found');
      navigate('/projects');
      return;
    }
    setProject(currentProject);

    // Load project-specific settings
    const savedSettings = localStorage.getItem(`project-settings-${id}`);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [id, navigate]);


  // Save settings to local storage
  useEffect(() => {
    if (project) {
      localStorage.setItem(`project-settings-${project.id}`, JSON.stringify(settings));
    }
  }, [settings, project]);


  const handleInputChange = (field: keyof ProjectSettingsType, value: number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };


  if (!project) {
    return null; // Or a loading indicator
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-8 animate-in">
        <div className="flex items-center gap-4">
          <Button
            variant="link"
            onClick={() => navigate(-1)}
            className="p-0 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Project
          </Button>
          <h1 className="text-2xl font-semibold">Project Settings: {project.name}</h1>
        </div>

        <div className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="general-settings">
              <AccordionTrigger>General settings</AccordionTrigger>
              <AccordionContent>
                {/* General settings content (if any) */}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="title-description-settings">
              <AccordionTrigger>Title and description settings</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Maximum title characters</label>
                    <Input
                      type="number"
                      value={settings.maxDescriptionCharacters}
                      onChange={(e) => handleInputChange('maxDescriptionCharacters', parseInt(e.target.value, 10))}
                      className="w-24"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="keyword-settings">
              <AccordionTrigger>Keywords settings</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Keyword count</label>
                    <Select
                      value={settings.keywordCount.toString()}
                      onValueChange={(value) => handleInputChange('keywordCount', parseInt(value, 10))}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select keyword count" />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 10, 20, 30, 50].map((count) => (
                          <SelectItem key={count} value={count.toString()}>
                            {count}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettings;
