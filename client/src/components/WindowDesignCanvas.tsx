import { forwardRef } from "react";
import WindowDrawing from "@/components/WindowDrawing";
import type { Window } from "@shared/schema";

interface WindowDesignCanvasProps {
  windows: Window[];
  projectName: string;
  onExportPDF?: () => void;
}

const WindowDesignCanvas = forwardRef<HTMLDivElement, WindowDesignCanvasProps>(
  ({ windows, projectName, onExportPDF }, ref) => {
    return (
      <main className="flex-1 bg-background overflow-auto relative p-6" ref={ref}>
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-medium">Window Design - {projectName}</h2>
            <div className="flex space-x-2">
              {windows.length > 0 && (
                <button
                  onClick={onExportPDF}
                  className="px-3 py-1 text-sm bg-blue-600 text-white border border-blue-700 rounded-md flex items-center space-x-1 hover:bg-blue-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="18" x2="12" y2="12"></line>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                  </svg>
                  <span>Export PDF</span>
                </button>
              )}
              <button className="px-3 py-1 text-sm border border-gray-300 rounded-md flex items-center space-x-1 hover:bg-gray-50">
                <span className="material-icons text-sm">zoom_in</span>
                <span>Zoom</span>
              </button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded-md flex items-center space-x-1 hover:bg-gray-50">
                <span className="material-icons text-sm">grid_on</span>
                <span>Grid</span>
              </button>
            </div>
          </div>
          
          <div className="border border-gray-200 bg-gray-50 rounded-md min-h-[800px] p-8 relative">
            {windows.map((window) => (
              <WindowDrawing key={window.id} window={window} />
            ))}
            
            {windows.length === 0 && (
              <div className="border-2 border-dashed border-gray-300 rounded-md p-8 flex items-center justify-center mt-4" style={{ height: '240px' }}>
                <div className="text-center text-gray-500">
                  <span className="material-icons text-4xl mb-2">add_box</span>
                  <p>Add a window using the form on the left</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }
);

WindowDesignCanvas.displayName = "WindowDesignCanvas";

export default WindowDesignCanvas;
