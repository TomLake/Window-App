import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  onExportPDF: () => void;
}

export default function Header({ projectName, onProjectNameChange, onExportPDF }: HeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(projectName);
  
  const handleEditName = () => {
    setTempName(projectName);
    setIsEditing(true);
  };
  
  const handleSaveName = () => {
    onProjectNameChange(tempName);
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setTempName(projectName);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center shadow-sm">
      <div className="flex items-center space-x-2">
        <span className="material-icons text-primary">architecture</span>
        <h1 className="text-xl font-semibold text-textPrimary">WindowDraft Pro</h1>
        
        {isEditing ? (
          <div className="ml-4 flex items-center">
            <Input
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="text-sm max-w-[200px]"
            />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSaveName} 
              className="ml-1"
            >
              <span className="material-icons text-sm">check</span>
            </Button>
          </div>
        ) : (
          <div 
            className="ml-4 flex items-center text-sm text-gray-700 hover:text-gray-900 cursor-pointer"
            onClick={handleEditName}
          >
            <span>{projectName}</span>
            <span className="material-icons text-sm ml-1">edit</span>
          </div>
        )}
      </div>
      
      <div className="flex space-x-4">
        <Button variant="outline" className="flex items-center gap-1">
          <span className="material-icons text-sm">save</span>
          Save Project
        </Button>
        <Button onClick={onExportPDF} className="flex items-center gap-1">
          <span className="material-icons text-sm">file_download</span>
          Export PDF
        </Button>
      </div>
    </header>
  );
}
