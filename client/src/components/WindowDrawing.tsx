import { useMemo } from "react";
import type { Window } from "@shared/schema";
import { windowTypes } from "@/lib/windowTypes";

interface WindowDrawingProps {
  window: Window;
}

export default function WindowDrawing({ window }: WindowDrawingProps) {
  const { type, width, height, location, glassType } = window;
  
  // Calculate SVG dimensions while maintaining a minimum size and aspect ratio
  const maxSvgWidth = 300;
  const maxSvgHeight = 240;
  
  // Calculate scale factor
  const scaleFactor = useMemo(() => {
    const widthRatio = maxSvgWidth / width;
    const heightRatio = maxSvgHeight / height;
    return Math.min(widthRatio, heightRatio, 0.2); // Max scale 0.2 to keep reasonable size
  }, [width, height]);
  
  // Calculate final SVG dimensions
  const svgWidth = Math.round(width * scaleFactor);
  const svgHeight = Math.round(height * scaleFactor);
  
  // Add extra space for dimensions on the sides
  const extraWidthForDimensions = 50; // Space for height dimension on the right
  const extraHeightForDimensions = 60; // Space for width dimension at the bottom
  
  // Find window type configuration
  const windowConfig = windowTypes.find(w => w.id === type) || windowTypes[0];
  
  // Determine if using obscure glass
  const isObscureGlass = glassType === "Obscure" || glassType === "Tinted";
  const glassColor = isObscureGlass ? "#e6f0fa" : "#dbeafe"; // Slightly different blue for obscure glass
  
  // Frame thickness
  const frameThickness = 3; // Thicker frame
  const frameInset = frameThickness + 2; // Inset from frame to glass
  const casementWidth = 2; // Casement line width
  
  // Render the appropriate window based on type
  const renderWindow = () => {
    switch (windowConfig.id) {
      case "single":
        return (
          <>
            {/* Outer Frame */}
            <rect x="0" y="0" width={svgWidth} height={svgHeight} className="window-frame" />
            
            {/* Glass */}
            <rect 
              x={frameInset} 
              y={frameInset} 
              width={svgWidth - (frameInset * 2)} 
              height={svgHeight - (frameInset * 2)} 
              fill={glassColor} 
              stroke="#94a3b8" 
              strokeWidth="1" 
            />
            
            {/* Casement indicators */}
            <rect 
              x={frameInset - 1} 
              y={frameInset - 1} 
              width={svgWidth - (frameInset * 2) + 2} 
              height={svgHeight - (frameInset * 2) + 2} 
              fill="none" 
              className="window-casement" 
            />
            
            {/* Opening direction */}
            <line 
              x1={svgWidth * 0.2} 
              y1={svgHeight * 0.2} 
              x2={svgWidth * 0.8} 
              y2={svgHeight * 0.8} 
              stroke="#334155" 
              strokeWidth={casementWidth} 
            />
            <line 
              x1={svgWidth * 0.2} 
              y1={svgHeight * 0.8} 
              x2={svgWidth * 0.8} 
              y2={svgHeight * 0.2} 
              stroke="#334155" 
              strokeWidth={casementWidth} 
            />
          </>
        );
      
      case "double":
        return (
          <>
            {/* Main frame */}
            <rect x="0" y="0" width={svgWidth} height={svgHeight} className="window-frame" />
            
            {/* Middle divider */}
            <line 
              x1={svgWidth / 2} 
              y1="0" 
              x2={svgWidth / 2} 
              y2={svgHeight} 
              className="window-frame" 
              strokeWidth={frameThickness}
            />
            
            {/* Left pane glass */}
            <rect 
              x={frameInset} 
              y={frameInset} 
              width={(svgWidth / 2) - frameInset - (frameThickness / 2)} 
              height={svgHeight - (frameInset * 2)} 
              fill={glassColor} 
              stroke="#94a3b8" 
              strokeWidth="1" 
            />
            
            {/* Right pane glass */}
            <rect 
              x={(svgWidth / 2) + (frameThickness / 2)} 
              y={frameInset} 
              width={(svgWidth / 2) - frameInset - (frameThickness / 2)} 
              height={svgHeight - (frameInset * 2)} 
              fill={glassColor} 
              stroke="#94a3b8" 
              strokeWidth="1" 
            />
            
            {/* Left casement */}
            <rect 
              x={frameInset - 1} 
              y={frameInset - 1} 
              width={(svgWidth / 2) - frameInset - (frameThickness / 2) + 2} 
              height={svgHeight - (frameInset * 2) + 2} 
              fill="none" 
              className="window-casement" 
            />
            
            {/* Right casement */}
            <rect 
              x={(svgWidth / 2) + (frameThickness / 2) - 1} 
              y={frameInset - 1} 
              width={(svgWidth / 2) - frameInset - (frameThickness / 2) + 2} 
              height={svgHeight - (frameInset * 2) + 2} 
              fill="none" 
              className="window-casement" 
            />
            
            {/* Opening direction for left pane */}
            <line 
              x1={svgWidth * 0.15} 
              y1={svgHeight * 0.2} 
              x2={svgWidth * 0.35} 
              y2={svgHeight * 0.8} 
              stroke="#334155" 
              strokeWidth={casementWidth} 
            />
            <line 
              x1={svgWidth * 0.15} 
              y1={svgHeight * 0.8} 
              x2={svgWidth * 0.35} 
              y2={svgHeight * 0.2} 
              stroke="#334155" 
              strokeWidth={casementWidth} 
            />
            
            {/* Opening direction for right pane */}
            <line 
              x1={svgWidth * 0.65} 
              y1={svgHeight * 0.2} 
              x2={svgWidth * 0.85} 
              y2={svgHeight * 0.8} 
              stroke="#334155" 
              strokeWidth={casementWidth} 
            />
            <line 
              x1={svgWidth * 0.65} 
              y1={svgHeight * 0.8} 
              x2={svgWidth * 0.85} 
              y2={svgHeight * 0.2} 
              stroke="#334155" 
              strokeWidth={casementWidth} 
            />
          </>
        );
      
      case "triple":
        return (
          <>
            {/* Frame */}
            <rect x="0" y="0" width={svgWidth} height={svgHeight} className="window-frame" />
            
            {/* Vertical dividers */}
            <line 
              x1={svgWidth / 3} 
              y1="0" 
              x2={svgWidth / 3} 
              y2={svgHeight} 
              className="window-frame" 
              strokeWidth={frameThickness}
            />
            <line 
              x1={(svgWidth / 3) * 2} 
              y1="0" 
              x2={(svgWidth / 3) * 2} 
              y2={svgHeight} 
              className="window-frame" 
              strokeWidth={frameThickness}
            />
            
            {/* First pane glass */}
            <rect 
              x={frameInset} 
              y={frameInset} 
              width={(svgWidth / 3) - frameInset - (frameThickness / 2)} 
              height={svgHeight - (frameInset * 2)} 
              fill={glassColor} 
              stroke="#94a3b8" 
              strokeWidth="1" 
            />
            
            {/* Second pane glass */}
            <rect 
              x={(svgWidth / 3) + (frameThickness / 2)} 
              y={frameInset} 
              width={(svgWidth / 3) - frameThickness} 
              height={svgHeight - (frameInset * 2)} 
              fill={glassColor} 
              stroke="#94a3b8" 
              strokeWidth="1" 
            />
            
            {/* Third pane glass */}
            <rect 
              x={((svgWidth / 3) * 2) + (frameThickness / 2)} 
              y={frameInset} 
              width={(svgWidth / 3) - frameInset - (frameThickness / 2)} 
              height={svgHeight - (frameInset * 2)} 
              fill={glassColor} 
              stroke="#94a3b8" 
              strokeWidth="1" 
            />
            
            {/* Casements for each section */}
            <rect 
              x={frameInset - 1} 
              y={frameInset - 1} 
              width={(svgWidth / 3) - frameInset - (frameThickness / 2) + 2} 
              height={svgHeight - (frameInset * 2) + 2} 
              fill="none" 
              className="window-casement" 
            />
            
            <rect 
              x={(svgWidth / 3) + (frameThickness / 2) - 1} 
              y={frameInset - 1} 
              width={(svgWidth / 3) - frameThickness + 2} 
              height={svgHeight - (frameInset * 2) + 2} 
              fill="none" 
              className="window-casement" 
            />
            
            <rect 
              x={((svgWidth / 3) * 2) + (frameThickness / 2) - 1} 
              y={frameInset - 1} 
              width={(svgWidth / 3) - frameInset - (frameThickness / 2) + 2} 
              height={svgHeight - (frameInset * 2) + 2} 
              fill="none" 
              className="window-casement" 
            />
            
            {/* Opening direction for first pane */}
            <line 
              x1={svgWidth * 0.08} 
              y1={svgHeight * 0.2} 
              x2={svgWidth * 0.25} 
              y2={svgHeight * 0.8} 
              stroke="#334155" 
              strokeWidth={casementWidth} 
            />
            <line 
              x1={svgWidth * 0.08} 
              y1={svgHeight * 0.8} 
              x2={svgWidth * 0.25} 
              y2={svgHeight * 0.2} 
              stroke="#334155" 
              strokeWidth={casementWidth} 
            />
            
            {/* Opening direction for third pane */}
            <line 
              x1={svgWidth * 0.75} 
              y1={svgHeight * 0.2} 
              x2={svgWidth * 0.92} 
              y2={svgHeight * 0.8} 
              stroke="#334155" 
              strokeWidth={casementWidth} 
            />
            <line 
              x1={svgWidth * 0.75} 
              y1={svgHeight * 0.8} 
              x2={svgWidth * 0.92} 
              y2={svgHeight * 0.2} 
              stroke="#334155" 
              strokeWidth={casementWidth} 
            />
          </>
        );
        
      case "sliding":
        return (
          <>
            {/* Frame */}
            <rect x="0" y="0" width={svgWidth} height={svgHeight} className="window-frame" />
            
            {/* Center divider */}
            <line 
              x1={svgWidth / 2} 
              y1="0" 
              x2={svgWidth / 2} 
              y2={svgHeight} 
              className="window-frame" 
              strokeWidth={frameThickness}
            />
            
            {/* Glass panes */}
            <rect 
              x={frameInset} 
              y={frameInset} 
              width={(svgWidth / 2) - frameInset - (frameThickness / 2)} 
              height={svgHeight - (frameInset * 2)} 
              fill={glassColor} 
              stroke="#94a3b8" 
              strokeWidth="1" 
            />
            
            <rect 
              x={(svgWidth / 2) + (frameThickness / 2)} 
              y={frameInset} 
              width={(svgWidth / 2) - frameInset - (frameThickness / 2)} 
              height={svgHeight - (frameInset * 2)} 
              fill={glassColor} 
              stroke="#94a3b8" 
              strokeWidth="1" 
            />
            
            {/* Casements */}
            <rect 
              x={frameInset - 1} 
              y={frameInset - 1} 
              width={(svgWidth / 2) - frameInset - (frameThickness / 2) + 2} 
              height={svgHeight - (frameInset * 2) + 2} 
              fill="none" 
              className="window-casement" 
            />
            
            <rect 
              x={(svgWidth / 2) + (frameThickness / 2) - 1} 
              y={frameInset - 1} 
              width={(svgWidth / 2) - frameInset - (frameThickness / 2) + 2} 
              height={svgHeight - (frameInset * 2) + 2} 
              fill="none" 
              className="window-casement" 
            />
            
            {/* Sliding indicators (tracks) */}
            <line 
              x1={svgWidth * 0.25} 
              y1={svgHeight * 0.1} 
              x2={svgWidth * 0.25} 
              y2={svgHeight * 0.9} 
              className="window-section" 
            />
            <line 
              x1={svgWidth * 0.75} 
              y1={svgHeight * 0.1} 
              x2={svgWidth * 0.75} 
              y2={svgHeight * 0.9} 
              className="window-section" 
            />
            
            {/* Sliding arrows */}
            <line 
              x1={svgWidth * 0.6} 
              y1={svgHeight * 0.5} 
              x2={svgWidth * 0.9} 
              y2={svgHeight * 0.5} 
              stroke="#334155" 
              strokeWidth={casementWidth} 
            />
            <line 
              x1={svgWidth * 0.85} 
              y1={svgHeight * 0.45} 
              x2={svgWidth * 0.9} 
              y2={svgHeight * 0.5} 
              stroke="#334155" 
              strokeWidth={casementWidth} 
            />
            <line 
              x1={svgWidth * 0.85} 
              y1={svgHeight * 0.55} 
              x2={svgWidth * 0.9} 
              y2={svgHeight * 0.5} 
              stroke="#334155" 
              strokeWidth={casementWidth} 
            />
          </>
        );
      
      case "fixed":
        return (
          <>
            {/* Frame */}
            <rect x="0" y="0" width={svgWidth} height={svgHeight} className="window-frame" />
            
            {/* Glass */}
            <rect 
              x={frameInset} 
              y={frameInset} 
              width={svgWidth - (frameInset * 2)} 
              height={svgHeight - (frameInset * 2)} 
              fill={glassColor} 
              stroke="#94a3b8" 
              strokeWidth="1" 
            />
            
            {/* Casement */}
            <rect 
              x={frameInset - 1} 
              y={frameInset - 1} 
              width={svgWidth - (frameInset * 2) + 2} 
              height={svgHeight - (frameInset * 2) + 2} 
              fill="none" 
              className="window-casement" 
            />
            
            {/* Fixed indicators (crosshairs) */}
            <line 
              x1={svgWidth * 0.3} 
              y1={svgHeight * 0.3} 
              x2={svgWidth * 0.7} 
              y2={svgHeight * 0.7} 
              stroke="#334155" 
              strokeWidth="1" 
            />
            <line 
              x1={svgWidth * 0.3} 
              y1={svgHeight * 0.7} 
              x2={svgWidth * 0.7} 
              y2={svgHeight * 0.3} 
              stroke="#334155" 
              strokeWidth="1" 
            />
          </>
        );
        
      case "patio":
        return (
          <>
            {/* Frame */}
            <rect x="0" y="0" width={svgWidth} height={svgHeight} className="window-frame" />
            
            {/* Center divider */}
            <line 
              x1={svgWidth / 2} 
              y1="0" 
              x2={svgWidth / 2} 
              y2={svgHeight} 
              className="window-frame" 
              strokeWidth={frameThickness}
            />
            
            {/* Glass panes */}
            <rect 
              x={frameInset} 
              y={frameInset} 
              width={(svgWidth / 2) - frameInset - (frameThickness / 2)} 
              height={svgHeight - (frameInset * 2)} 
              fill={glassColor} 
              stroke="#94a3b8" 
              strokeWidth="1" 
            />
            
            <rect 
              x={(svgWidth / 2) + (frameThickness / 2)} 
              y={frameInset} 
              width={(svgWidth / 2) - frameInset - (frameThickness / 2)} 
              height={svgHeight - (frameInset * 2)} 
              fill={glassColor} 
              stroke="#94a3b8" 
              strokeWidth="1" 
            />
            
            {/* Casements */}
            <rect 
              x={frameInset - 1} 
              y={frameInset - 1} 
              width={(svgWidth / 2) - frameInset - (frameThickness / 2) + 2} 
              height={svgHeight - (frameInset * 2) + 2} 
              fill="none" 
              className="window-casement" 
            />
            
            <rect 
              x={(svgWidth / 2) + (frameThickness / 2) - 1} 
              y={frameInset - 1} 
              width={(svgWidth / 2) - frameInset - (frameThickness / 2) + 2} 
              height={svgHeight - (frameInset * 2) + 2} 
              fill="none" 
              className="window-casement" 
            />
            
            {/* Door handles - bigger for visibility */}
            <circle cx={svgWidth * 0.45} cy={svgHeight * 0.5} r={3} fill="#334155" />
            <circle cx={svgWidth * 0.55} cy={svgHeight * 0.5} r={3} fill="#334155" />
            
            {/* Opening indicators */}
            <line 
              x1={svgWidth * 0.25} 
              y1={svgHeight * 0.2} 
              x2={svgWidth * 0.25} 
              y2={svgHeight * 0.8} 
              className="window-section" 
            />
            <line 
              x1={svgWidth * 0.75} 
              y1={svgHeight * 0.2} 
              x2={svgWidth * 0.75} 
              y2={svgHeight * 0.8} 
              className="window-section" 
            />
          </>
        );
      
      default:
        return (
          <>
            {/* Default window (single) */}
            <rect x="0" y="0" width={svgWidth} height={svgHeight} className="window-frame" />
            
            <rect 
              x={frameInset} 
              y={frameInset} 
              width={svgWidth - (frameInset * 2)} 
              height={svgHeight - (frameInset * 2)} 
              fill={glassColor} 
              stroke="#94a3b8" 
              strokeWidth="1" 
            />
            
            <rect 
              x={frameInset - 1} 
              y={frameInset - 1} 
              width={svgWidth - (frameInset * 2) + 2} 
              height={svgHeight - (frameInset * 2) + 2} 
              fill="none" 
              className="window-casement" 
            />
          </>
        );
    }
  };
  
  return (
    <div className="mb-16 inline-block mx-4">
      <div className="relative">
        <svg 
          width={svgWidth + extraWidthForDimensions} 
          height={svgHeight + extraHeightForDimensions} 
          viewBox={`0 0 ${svgWidth + extraWidthForDimensions} ${svgHeight + extraHeightForDimensions}`} 
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          {/* Window rendering */}
          {renderWindow()}
          
          {/* Width dimension - bottom */}
          <line x1="0" y1={svgHeight + 15} x2={svgWidth} y2={svgHeight + 15} stroke="#64748b" strokeWidth="1" />
          <line x1="0" y1={svgHeight + 10} x2="0" y2={svgHeight + 20} stroke="#64748b" strokeWidth="1" />
          <line x1={svgWidth} y1={svgHeight + 10} x2={svgWidth} y2={svgHeight + 20} stroke="#64748b" strokeWidth="1" />
          <text x={svgWidth / 2} y={svgHeight + 30} textAnchor="middle" className="dimension-text">{width} mm</text>
          
          {/* Height dimension - right side */}
          <line x1={svgWidth + 15} y1="0" x2={svgWidth + 15} y2={svgHeight} stroke="#64748b" strokeWidth="1" />
          <line x1={svgWidth + 10} y1="0" x2={svgWidth + 20} y2="0" stroke="#64748b" strokeWidth="1" />
          <line x1={svgWidth + 10} y1={svgHeight} x2={svgWidth + 20} y2={svgHeight} stroke="#64748b" strokeWidth="1" />
          
          {/* Height dimension text - improved visibility */}
          <text 
            x={svgWidth + 35} 
            y={svgHeight / 2} 
            textAnchor="middle" 
            transform={`rotate(90, ${svgWidth + 35}, ${svgHeight / 2})`} 
            className="dimension-text"
          >
            {height} mm
          </text>
          
          {/* Location label */}
          <text 
            x={svgWidth / 2} 
            y={svgHeight + 50} 
            textAnchor="middle" 
            fontSize="11" 
            fontWeight="500" 
            fill="#334155"
          >
            {location}
          </text>
          
          {/* Glass type indication if obscure */}
          {isObscureGlass && (
            <text 
              x={svgWidth / 2} 
              y={svgHeight - 10} 
              textAnchor="middle" 
              fontSize="8" 
              fill="#334155"
            >
              ({glassType})
            </text>
          )}
        </svg>
      </div>
    </div>
  );
}
