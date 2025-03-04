import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
// import { useProjectManagement } from "@/hooks/useProjectManagement"; // Removed
import { generateCSVData } from "@/utils/csv";
import { toast } from "sonner";
import { Project } from '@/types';

interface CSVDownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

const CSVDownloadDialog: React.FC<CSVDownloadDialogProps> = ({ isOpen, onClose, projectId }) => {
  // const { project } = useProjectManagement(projectId); // Removed
  const [csvData, setCsvData] = React.useState<string>("");

    // Fetch the project data directly from local storage
    const [project, setProject] = React.useState<Project | null>(null);

    React.useEffect(() => {
        const projects: Project[] = JSON.parse(localStorage.getItem("projects") || "[]");
        const currentProject = projects.find(p => p.id === projectId);
        setProject(currentProject);
    }, [projectId]);

  React.useEffect(() => {
    if (project) {
      try {
        const csv = generateCSVData(project.images);
        setCsvData(csv);
      } catch (err) {
        toast.error(err.message || "Failed to generate CSV data");
        setCsvData("");
      }
    }
  }, [project]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[80%]">
        <DialogHeader>
          <DialogTitle>CSV Data</DialogTitle>
          <DialogDescription>
            Copy the following CSV data or download it as a file:
          </DialogDescription>
        </DialogHeader>
        <Textarea
          readOnly
          value={csvData}
          className="min-h-[300px] font-mono text-sm"
          onClick={(e) => e.target.select()}
        />
        <Button onClick={() => {
          const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = project?.name ? `${project.name}.csv` : `image_analysis_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          onClose();
          toast.success("CSV downloaded");
        }} className="w-full mt-4">
          Download CSV
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default CSVDownloadDialog;
