import type { Window } from "@shared/schema";

interface ProjectWindowsListProps {
  windows: Window[];
  onEdit: (window: Window) => void;
  onDelete: (windowId: number) => void;
}

export default function ProjectWindowsList({ windows, onEdit, onDelete }: ProjectWindowsListProps) {
  return (
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
              onClick={() => onDelete(window.id)}
              aria-label="Delete window"
            >
              <span className="material-icons text-sm">delete</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
