import { forwardRef } from "react";
import WindowDrawing from "@/components/WindowDrawing";
import type { Window } from "@shared/schema";

interface WindowDesignCanvasProps {
  windows: Window[];
  projectName: string;
}

const WindowDesignCanvas = forwardRef<HTMLDivElement, WindowDesignCanvasProps>(
  ({ windows, projectName }, ref) => {
    return (
      <main className="flex-1 bg-background overflow-auto relative p-6" ref={ref}>
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-medium">Window Design - {projectName}</h2>
            <div className="flex space-x-2">
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
