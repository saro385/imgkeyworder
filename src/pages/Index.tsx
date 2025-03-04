import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Upload,
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  Download,
  ArrowLeft,
  RefreshCw,
  Trash2,
  X,
  Pause,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ImageResult, Project, ProjectSettings } from "@/types";
import { generateCSVData } from "@/utils/csv";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MAX_IMAGES, DEFAULT_PROJECT_SETTINGS } from "@/config/constants"; // Import from constants
import EditableText from "@/components/ui/EditableText";
import { analyzeImage } from "@/services/api/index"; // Corrected import path
import { SettingsMenu } from "@/components/settings/SettingsMenu";
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
import { Input } from "@/components/ui/input";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import CSVDownloadDialog from "@/components/ui/CSVDownloadDialog";

// --- Utility Functions (moved outside the component) ---

const getBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// --- Custom Hook: useProjectManagement ---

const useProjectManagement = (projectId: string) => {
    const [project, setProject] = useState<Project | null>(null);

    useEffect(() => {
        const projects: Project[] = JSON.parse(localStorage.getItem("projects") || "[]");
        const currentProject = projects.find(p => p.id === projectId);
        setProject(currentProject);
    }, [projectId]);

    const updateProject = useCallback((updatedProject: Project) => {
        const projects: Project[] = JSON.parse(localStorage.getItem("projects") || "[]");
        const updatedProjects = projects.map((p) =>
            p.id === updatedProject.id ? updatedProject : p
        );
        localStorage.setItem("projects", JSON.stringify(updatedProjects));
        setProject(updatedProject);
    }, []);

    const addImagesToProject = useCallback((newImages: ImageResult[]) => {
        if (!project) return;
        const updatedProject = { ...project, images: [...newImages] };
        updateProject(updatedProject);
    }, [project, updateProject]);

    const deleteImageFromProject = useCallback((index: number) => {
        if (!project) return;
        const updatedImages = [...project.images];
        URL.revokeObjectURL(updatedImages[index].preview || ''); // Revoke object URL
        updatedImages.splice(index, 1);
        updateProject({ ...project, images: updatedImages });
    }, [project, updateProject]);

    return { project, updateProject, addImagesToProject, deleteImageFromProject };
};

// --- Sub-Components ---

interface ImageUploadButtonProps {
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    disabled: boolean;
    imageCount: number;
}

const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({ onImageUpload, disabled, imageCount }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="flex items-center gap-4">
            <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
                disabled={disabled}
            >
                <Upload className="w-4 h-4" />
                {imageCount > 0 ? "Add More Images" : "Upload Images"}
            </Button>
            {imageCount > 0 && (
                <span className="text-sm text-gray-600">
                    {imageCount} image{imageCount !== 1 ? 's' : ''} in project
                </span>
            )}
            <input
                type="file"
                ref={fileInputRef}
                onChange={onImageUpload}
                accept="image/*"
                multiple
                className="hidden"
            />
        </div>
    );
};

interface ImageCardProps {
    img: ImageResult;
    index: number;
    onRegenerate: (index: number) => Promise<void>;
    onDelete: (index: number) => void;
    loading: boolean;
    updateProject: (updatedProject: Project) => void;
    project: Project
}

const ImageCard: React.FC<ImageCardProps> = ({ img, index, onRegenerate, onDelete, loading, updateProject, project }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    return (
        <div className="bg-white rounded-lg overflow-hidden border border-gray-200 w-full">
            <div className="relative">
                {img.status === 'processing' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                )}
                <img
                    src={img.preview}
                    alt={img.file.name}
                    className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => onRegenerate(index)}
                        disabled={loading || img.status === 'processing'}
                        title="Regenerate"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => onDelete(index)}
                        disabled={loading || img.status === 'processing'}
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                    {img.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" title="Completed" />
                    ) : img.status === 'error' ? (
                        <XCircle className="w-5 h-5 text-red-500" title="Error" />
                    ) : null}
                </div>
            </div>
            <div className="p-4 space-y-3">
                <h3 className="font-medium text-sm truncate">{img.file.name}</h3>
                {img.output && (
                    <>
                        <div className="space-y-2">
                            <h4 className="text-xs font-medium text-gray-500 flex items-center justify-between">
                                Description:
                                <span className="text-gray-700 text-xs">({img.output.description.length} chars)</span>
                            </h4>
                            <EditableText
                                text={img.output.description}
                                onSave={(newDescription) => {
                                    const updatedImages = [...project.images];
                                    updatedImages[index] = {
                                        ...updatedImages[index],
                                        output: { ...img.output, description: newDescription },
                                    };
                                    updateProject({ ...project, images: updatedImages });
                                    toast.success("Description updated");
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-xs font-medium text-gray-500 flex items-center justify-between">
                                Keywords:
                                <span className="text-gray-700 text-xs">({img.output.keywords.length} words)</span>
                            </h4>
                            <div className="flex flex-wrap gap-1">
                                {img.output.keywords.slice(0, expanded ? undefined : 5).map((keyword, kidx) => (
                                    <span
                                        key={kidx}
                                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center gap-1"
                                    >
                                        {keyword}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 p-0 text-gray-500 hover:text-red-600"
                                            onClick={() => {
                                                const updatedImages = [...project.images];
                                                updatedImages[index] = {
                                                    ...updatedImages[index],
                                                    output: {
                                                        ...img.output,
                                                        keywords: img.output.keywords.filter((_, i) => i !== kidx),
                                                    },
                                                };
                                                updateProject({ ...project, images: updatedImages });
                                                toast.success("Keyword removed");
                                            }}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </span>
                                ))}
                                {img.output.keywords.length > 5 && (
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="text-xs text-blue-600 hover:text-blue-800 p-0"
                                        onClick={toggleExpanded}
                                    >
                                        {expanded ? 'Show Less' : 'Show More'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </>
                )}
                {img.error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                        Error: {img.error}
                    </div>
                )}
            </div>
        </div>
    );
};


interface ProgressSectionProps {
    progress: number;
}

const ProgressSection: React.FC<ProgressSectionProps> = ({ progress }) => (
    <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
            <span>Overall Progress</span>
            <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
    </div>
);

interface GenerateAnalysisButtonProps {
    onSubmit: () => Promise<void>;
    loading: boolean;
    canGenerateAnalysis: boolean; // Add canGenerateAnalysis prop
    paused: boolean;
    onPauseToggle: () => void;
}

const GenerateAnalysisButton: React.FC<GenerateAnalysisButtonProps> = ({ onSubmit, loading, canGenerateAnalysis, paused, onPauseToggle }) => { // Destructure canGenerateAnalysis
  const buttonText = loading ? (
    paused ? (
      <>
        <Play className="w-4 h-4 animate-none" />
        Resume Processing
      </>
    ) : (
      <>
        <Pause className="w-4 h-4 animate-spin" />
        Pause Processing
      </>
    )
  ) : (
    <>
      <Send className="w-4 h-4" />
      Generate Analysis
    </>
  );

  return (
    <Button
      onClick={onSubmit}
      disabled={!canGenerateAnalysis}
      className="w-full gap-2"
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {buttonText}
    </Button>
  );
};

// --- Main Component ---

const Index = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [loading, setLoading] = useState(false);
    const [csvDialogOpen, setCsvDialogOpen] = useState(false);
    const [csvData, setCsvData] = useState<string>("");
    const { project, updateProject, addImagesToProject, deleteImageFromProject } = useProjectManagement(id || '');
    const [projectSettings, setProjectSettings] = useState<ProjectSettings>(DEFAULT_PROJECT_SETTINGS);
    const [paused, setPaused] = useState(false);

    // Load project-specific settings
    useEffect(() => {
        if (id) {
            const savedSettings = localStorage.getItem(`project-settings-${id}`);
            if (savedSettings) {
                setProjectSettings(JSON.parse(savedSettings));
            }
        }
    }, [id]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const availableSlots = MAX_IMAGES - (project?.images.length || 0);

        if (files.length > availableSlots) {
            toast.error(`Maximum ${MAX_IMAGES} images allowed per project. You can upload only ${availableSlots} more images.`);
            return;
        }

        const validFiles = files.filter(file => file.size <= 20 * 1024 * 1024);
        if (validFiles.length < files.length) {
            toast.error("Some images are larger than 20MB and were not uploaded.");
        }

        const newImages = validFiles.map(file => ({
            file,
            status: 'pending' as const,
            preview: URL.createObjectURL(file)
        }));

        addImagesToProject(newImages);
        toast.success(`${validFiles.length} image${validFiles.length !== 1 ? 's' : ''} uploaded`);
    };


    const handleRegenerateImage = async (index: number) => {
        if (!project) return;

        const apiKey = settings.apiKeys[settings.apiProvider];
        if (!apiKey) {
            toast.error("Set API key in settings");
            navigate("/settings");
            return;
        }

        const updatedImages = [...project.images];
        updatedImages[index] = { ...updatedImages[index], status: 'processing' };
        updateProject({ ...project, images: updatedImages });

        try {
            const output = await analyzeImage(
                updatedImages[index].file,
                settings.apiProvider,
                apiKey,
                projectSettings
              );
            updatedImages[index] = { ...updatedImages[index], output, status: 'completed' };
            updateProject({ ...project, images: updatedImages });
            toast.success("Image regenerated");
        } catch (error) {
            updatedImages[index] = { ...updatedImages[index], status: 'error', error: error.message };
            updateProject({ ...project, images: updatedImages });
            toast.error("Failed to regenerate image");
        }
    };

    const handleSubmit = async () => {
        if (!project) return;
      
        const apiKey = settings.apiKeys[settings.apiProvider];
        if (!apiKey) {
          toast.error("Set API key in settings");
          navigate("/settings");
          return;
        }
      
        if (project.images.length === 0) {
          toast.error("Upload at least one image");
          return;
        }
              setLoading(true);
        let i = 0;
        const updatedImages = [...project.images];
        while (i < updatedImages.length) {
            if (paused) {
                setLoading(false);
                return;
            }

            if (updatedImages[i].status === 'completed') {
                i++;
                continue;
            }

            updatedImages[i] = { ...updatedImages[i], status: 'processing' };
            updateProject({ ...project, images: updatedImages });

            try {
                const output = await analyzeImage(
                    updatedImages[i].file,
                    settings.apiProvider,
                    apiKey,
                    projectSettings
                );
                updatedImages[i] = { ...updatedImages[i], output, status: 'completed' };
            } catch (error) {
                updatedImages[i] = { ...updatedImages[i], status: 'error', error: error.message };
            }
            updateProject({ ...project, images: updatedImages });
            i++;
        }

        setLoading(false);
        toast.success("All images processed");
    };

    const handleGenerateCSV = () => {
        if (!project) return;

        try {
            const csv = generateCSVData(project.images);
            setCsvData(csv);
            setCsvDialogOpen(true);
        } catch (err) {
            toast.error(err.message || "Failed to generate CSV data");
        }
    };

    const getProgressValue = () => {
        if (!project || project.images.length === 0) return 0;
        const completed = project.images.filter(img => img.status === 'completed').length;
        return (completed / project.images.length) * 100;
    };

    const canGenerateAnalysis = project && project.images.length > 0;

    const handleSettingsChange = (field: keyof ProjectSettings, value: number) => {
      const newSettings = { ...projectSettings, [field]: value };
      setProjectSettings(newSettings);
      localStorage.setItem(`project-settings-${id}`, JSON.stringify(newSettings));
    };

    const handlePauseToggle = () => {
        setPaused(!paused);
    };

    if (!project) return null;

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-8">
                <div className="max-w-6xl mx-auto space-y-8 animate-in">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <Button
                                variant="link"
                                onClick={() => navigate(-1)}
                                className="p-0 text-blue-600 hover:text-blue-800"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Projects
                            </Button>
                            <h1 className="text-3xl font-bold">{project.name}</h1>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={handleGenerateCSV} disabled={!project.images.some(img => img.status === 'completed')}>
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <Card className="p-6 relative">
                      <div className="space-y-4">
                        <h2 className="text-lg font-semibold mb-2">Project Settings</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium block mb-1">Max Description Characters</label>
                            <Input
                              type="number"
                              value={projectSettings.maxDescriptionCharacters}
                              onChange={(e) => handleSettingsChange('maxDescriptionCharacters', parseInt(e.target.value, 10))}
                              className="w-full text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium block mb-1">Keyword Count</label>
                            <Select
                              value={projectSettings.keywordCount.toString()}
                              onValueChange={(value) => handleSettingsChange('keywordCount', parseInt(value, 10))}
                              >
                                <SelectTrigger className="w-full h-9 text-sm">
                                  <SelectValue placeholder="Select count" />
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
                          <ImageUploadButton
                              onImageUpload={handleImageUpload}
                              disabled={loading}
                              imageCount={project.images.length}
                          />
                          {project.images.length > 0 && (
                              <ProgressSection progress={getProgressValue()} />
                          )}
                          <GenerateAnalysisButton
                              onSubmit={handleSubmit}
                              loading={loading}
                              paused={paused}
                              onPauseToggle={handlePauseToggle}
                              canGenerateAnalysis={canGenerateAnalysis} // Pass canGenerateAnalysis
                          />
                      </div>
                    </Card>

                    {project.images.length > 0 && (
                        <Card className="p-6">
                            <Carousel opts={{ loop: true, dragFree: true, slidesToScroll: 4 }}>
                                <CarouselContent className="md:-ml-4">
                                    {project.images.map((img, index) => (
                                        <CarouselItem key={index} className="basis-1/4 md:pl-4">
                                            <div className="p-1">
                                                <ImageCard
                                                    img={img}
                                                    index={index}
                                                    onRegenerate={handleRegenerateImage}
                                                    onDelete={() => deleteImageFromProject(index)}
                                                    loading={loading}
                                                    updateProject={updateProject}
                                                    project={project}
                                                />
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious className="left-1" />
                                <CarouselNext className="right-1" />
                            </Carousel>
                        </Card>
                    )}

                    <CSVDownloadDialog
                        isOpen={csvDialogOpen}
                        onClose={() => setCsvDialogOpen(false)}
                        csvData={csvData}
                        projectId={id} // Pass the id prop
                    />
                </div>
            </div>
        </>
    );
};

export default Index;
