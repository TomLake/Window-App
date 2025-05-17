import { useState } from "react";
import type { Window } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProjectWindowsListProps {
  windows: Window[];
  onEdit: (window: Window) => void;
  onDelete: (windowId: number) => void;
}

export default function ProjectWindowsList({ windows, onEdit, onDelete }: ProjectWindowsListProps) {
  const [windowToDelete, setWindowToDelete] = useState<number | null>(null);
  const handleConfirmDelete = () => {
    if (windowToDelete) {
      onDelete(windowToDelete);
      setWindowToDelete(null);
    }
  };

  return (
    <>
      <div className="space-y-2">
        {windows.length === 0 && (
          <div className="p-4 text-center text-gray-500 bg-gray-50 border border-gray-200 rounded-md">
            No windows added yet
          </div>
        )}
        
        {windows.map((window) => (
          <div key={window.id} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-md">
            <div>
              <div className="font-medium text-sm">{window.name}</div>
              <div className="text-xs text-gray-500">{window.width}×{window.height} mm</div>
            </div>
            <div className="flex space-x-1">
              <button 
                className="p-1 text-gray-500 hover:text-primary" 
                onClick={() => onEdit(window)}
                aria-label="Edit window"
              >
                <span className="material-icons text-sm">edit</span>
              </button>
              <button 
                className="p-1 text-gray-500 hover:text-red-500" 
                onClick={() => setWindowToDelete(window.id)}
                aria-label="Delete window"
              >
                <span className="material-icons text-sm">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={windowToDelete !== null} onOpenChange={(open) => !open && setWindowToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the window 
              from your project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
