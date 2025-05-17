import { windowTypes } from "@/lib/windowTypes";
import type { Window } from "@shared/schema";

interface WindowTemplatesProps {
  onSelectTemplate: (template: Window) => void;
}

// Template definitions for common window configurations
const templates = [
  { id: 1, name: "Bedroom", type: "double", width: 1110, height: 1130, location: "Bedroom", glassType: "Clear", projectId: 1, positionX: 0, positionY: 0 },
  { id: 2, name: "Hallway", type: "double", width: 1090, height: 1100, location: "Hallway", glassType: "Clear", projectId: 1, positionX: 0, positionY: 0 },
  { id: 3, name: "Bathroom", type: "double", width: 890, height: 940, location: "Bathroom", glassType: "Obscure", projectId: 1, positionX: 0, positionY: 0 },
  { id: 4, name: "Kitchen", type: "triple", width: 1470, height: 970, location: "Kitchen", glassType: "Clear", projectId: 1, positionX: 0, positionY: 0 },
  { id: 5, name: "Dining Room 1", type: "fixed", width: 760, height: 1100, location: "Dining Room", glassType: "Clear", projectId: 1, positionX: 0, positionY: 0 },
  { id: 6, name: "Dining Room 2", type: "double", width: 760, height: 1100, location: "Dining Room", glassType: "Clear", projectId: 1, positionX: 0, positionY: 0 },
  { id: 7, name: "Patio Doors", type: "patio", width: 1810, height: 2100, location: "Patio", glassType: "Clear", projectId: 1, positionX: 0, positionY: 0 }
];

export default function WindowTemplates({ onSelectTemplate }: WindowTemplatesProps) {
  const handleSelectTemplate = (template: typeof templates[0]) => {
    // Create a new template without the ID (so it will be treated as a new window)
    const newWindow = {
      projectId: template.projectId,
      name: template.name,
      type: template.type,
      width: template.width,
      height: template.height,
      location: template.location,
      glassType: template.glassType,
      positionX: template.positionX,
      positionY: template.positionY
    };
    onSelectTemplate(newWindow as Window);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {templates.map((template) => {
        // Find corresponding window type
        const windowType = windowTypes.find(w => w.id === template.type) || windowTypes[0];
        
        return (
          <div 
            key={template.id}
            className="border border-gray-200 rounded-md p-2 cursor-pointer hover:border-primary hover:bg-blue-50"
            onClick={() => handleSelectTemplate(template)}
          >
            <div className="bg-white p-1 mb-1 flex justify-center">
              <div style={{ width: '80px', height: '80px' }} className="relative">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Render appropriate window shape based on type */}
                  {template.type === 'single' && (
                    <>
                      <rect x="10" y="10" width="80" height="80" className="window-frame" />
                      <rect x="11" y="11" width="78" height="78" className="window-glass" />
                    </>
                  )}
                  
                  {template.type === 'double' && (
                    <>
                      <rect x="10" y="10" width="80" height="80" className="window-frame" />
                      <line x1="50" y1="10" x2="50" y2="90" className="window-frame" />
                      <rect x="11" y="11" width="38" height="78" className="window-glass" />
                      <rect x="51" y="11" width="38" height="78" className="window-glass" />
                    </>
                  )}
                  
                  {template.type === 'triple' && (
                    <>
                      <rect x="5" y="15" width="90" height="70" className="window-frame" />
                      <line x1="33" y1="15" x2="33" y2="85" className="window-frame" />
                      <line x1="67" y1="15" x2="67" y2="85" className="window-frame" />
                      <rect x="6" y="16" width="26" height="68" className="window-glass" />
                      <rect x="34" y="16" width="32" height="68" className="window-glass" />
                      <rect x="68" y="16" width="26" height="68" className="window-glass" />
                    </>
                  )}
                  
                  {template.type === 'sliding' && (
                    <>
                      <rect x="10" y="10" width="80" height="80" className="window-frame" />
                      <line x1="50" y1="10" x2="50" y2="90" className="window-frame" />
                      <rect x="11" y="11" width="38" height="78" className="window-glass" />
                      <rect x="51" y="11" width="38" height="78" className="window-glass" />
                      <line x1="30" y1="50" x2="70" y2="50" stroke="#334155" strokeWidth="1" />
                    </>
                  )}
                  
                  {template.type === 'fixed' && (
                    <>
                      <rect x="15" y="10" width="70" height="80" className="window-frame" />
                      <rect x="16" y="11" width="68" height="78" className="window-glass" />
                    </>
                  )}
                  
                  {template.type === 'patio' && (
                    <>
                      <rect x="5" y="5" width="90" height="90" className="window-frame" />
                      <line x1="50" y1="5" x2="50" y2="95" className="window-frame" />
                      <rect x="6" y="6" width="43" height="88" className="window-glass" />
                      <rect x="51" y="6" width="43" height="88" className="window-glass" />
                    </>
                  )}
                </svg>
              </div>
            </div>
            <div className="text-xs text-center font-medium">{template.name}</div>
            <div className="text-xs text-gray-500 text-center">{template.width}×{template.height} mm</div>
          </div>
        );
      })}
    </div>
  );
}
