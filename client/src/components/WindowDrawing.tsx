import { useMemo } from "react";
import type { Window } from "@shared/schema";
import { windowTypes } from "@/lib/windowTypes";

interface WindowDrawingProps {
  window: Window;
}

export default function WindowDrawing({ window }: WindowDrawingProps) {
  const { 
    type, 
    width, 
    height, 
    name = "Window", // Provide default name to prevent rendering issues
    openableCasements = "left", // Default left casement opens
    hasGeorgianBars = false,
    georgianBarsHorizontal = 1,
    georgianBarsVertical = 1,
    hasTransom = false,
    transomHeight = 400
  } = window;
  
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
  
  // Add extra space for dimensions on the sides and label at the bottom
  const extraWidthForDimensions = 50; // Space for height dimension on the right
  const extraHeightForDimensions = 60; // Space for width dimension at the bottom
  const extraHeightForLabel = 30; // Space for window name label at the bottom
  
  // Find window type configuration
  const windowConfig = windowTypes.find(w => w.id === type) || windowTypes[0];
  
  // White color for the outer frame
  const frameColor = "white";
  // Color for standard glass panes (empty/transparent)
  const glassColor = "white"; 
  // Light blue color for inner glass panes
  const innerGlassColor = "#e5f0ff";
  
  // Frame thickness (45mm scaled to SVG size)
  const frameThickness = Math.max(3, Math.round(45 * scaleFactor)); // 45mm scaled to SVG size, minimum 3px
  
  // Mullion thickness (30mm scaled to SVG size) - the dividers between casements
  const mullionThickness = Math.max(2, Math.round(30 * scaleFactor)); // 30mm scaled to SVG size, minimum 2px
  
  const frameInset = frameThickness + 2; // Inset from frame to glass
  const casementWidth = 2; // Casement line width
  
  // Inner border for casements (50mm scaled to SVG size)
  const innerBorderWidth = Math.max(2, Math.round(50 * scaleFactor)); // Scale 50mm to SVG size, minimum 2px
  
  // Function to render Georgian bars for a window pane
  const renderGeorgianBars = (x: number, y: number, width: number, height: number) => {
    if (!hasGeorgianBars) return null;
    
    // Use the user-defined number of horizontal and vertical bars
    // If value is 0, no bars will be rendered
    const numHorizontalBars = typeof georgianBarsHorizontal === 'number' ? georgianBarsHorizontal : 1;
    const numVerticalBars = typeof georgianBarsVertical === 'number' ? georgianBarsVertical : 1;
    
    const barColor = "#475569";
    const barWidth = 1.5;
    
    // Create the bars
    const bars = [];
    
    // Horizontal bars
    if (numHorizontalBars > 0) {
      // Create horizontal bars based on specified count
      const horizontalSpacing = height / (numHorizontalBars + 1);
      for (let i = 1; i <= numHorizontalBars; i++) {
        const yPos = y + horizontalSpacing * i;
        bars.push(
          <line 
            key={`h-${i}`}
            x1={x} 
            y1={yPos} 
            x2={x + width} 
            y2={yPos} 
            stroke={barColor} 
            strokeWidth={barWidth} 
          />
        );
      }
    }
    
    // Vertical bars
    if (numVerticalBars > 0) {
      // Create vertical bars based on specified count
      const verticalSpacing = width / (numVerticalBars + 1);
      for (let i = 1; i <= numVerticalBars; i++) {
        const xPos = x + verticalSpacing * i;
        bars.push(
          <line 
            key={`v-${i}`}
            x1={xPos} 
            y1={y} 
            x2={xPos} 
            y2={y + height} 
            stroke={barColor} 
            strokeWidth={barWidth} 
          />
        );
      }
    }
    
    return bars;
  };
  
  // Function to render transom bar for a window
  const renderTransom = (x: number, y: number, paneWidth: number) => {
    if (!hasTransom) return null;
    
    // Calculate the scaled transom height from the top
    // Use a default value of 400 if transomHeight is null
    const safeTransomHeight = typeof transomHeight === 'number' ? transomHeight : 400;
    const scaledTransomHeight = Math.min(safeTransomHeight, height) * scaleFactor;
    const transomY = y + scaledTransomHeight;
    const transomThickness = 2.5; // Slightly thicker than other bars
    const transomColor = "#334155";
    
    return (
      <rect
        x={x}
        y={transomY - (transomThickness / 2)}
        width={paneWidth}
        height={transomThickness}
        fill={transomColor}
      />
    );
  };
  
  // Function to render dashed lines to indicate the hinge side for opening casements
  const renderHingeIndicator = (x: number, y: number, width: number, height: number, hingeSide: 'left' | 'right') => {
    // Determine the points for the dashed line
    let startX, startY, middleX, middleY, endX, endY;
    
    if (hingeSide === 'left') {
      // If hinges are on the left, line starts at top right, goes to middle left, then to bottom right
      startX = x + width; // Top right corner X
      startY = y;         // Top right corner Y
      middleX = x;        // Middle left X
      middleY = y + (height / 2); // Middle left Y
      endX = x + width;   // Bottom right corner X
      endY = y + height;  // Bottom right corner Y
    } else {
      // If hinges are on the right, line starts at top left, goes to middle right, then to bottom left
      startX = x;         // Top left corner X
      startY = y;         // Top left corner Y
      middleX = x + width; // Middle right X
      middleY = y + (height / 2); // Middle right Y
      endX = x;          // Bottom left corner X
      endY = y + height; // Bottom left corner Y
    }
    
    return (
      <polyline
        points={`${startX},${startY} ${middleX},${middleY} ${endX},${endY}`}
        fill="none"
        stroke="#334155"
        strokeWidth="1"
        strokeDasharray="3,3"
      />
    );
  };
  

  
  // Render the appropriate window based on type
  const renderWindow = () => {
    switch (windowConfig.id) {
      case "single":
        return (
          <>
            {/* Outer Frame */}
            <rect x="0" y="0" width={svgWidth} height={svgHeight} className="window-frame" />
            
            {/* Glass background */}
            <rect 
              x={frameInset} 
              y={frameInset} 
              width={svgWidth - (frameInset * 2)} 
              height={svgHeight - (frameInset * 2)} 
              fill={glassColor} 
              stroke="#94a3b8" 
              strokeWidth="1" 
            />
            
            {/* Inner blue glass pane */}
            <rect 
              x={frameInset + 10} 
              y={frameInset + 10} 
              width={svgWidth - (frameInset * 2) - 20} 
              height={svgHeight - (frameInset * 2) - 20} 
              fill={innerGlassColor} 
              stroke="none" 
            />
            
            {/* Georgian bars if enabled */}
            {renderGeorgianBars(
              frameInset,
              frameInset,
              svgWidth - (frameInset * 2),
              svgHeight - (frameInset * 2)
            )}
            
            {/* Transom if enabled */}
            {renderTransom(
              frameInset,
              frameInset,
              svgWidth - (frameInset * 2)
            )}
            
            {/* Casement indicators */}
            <rect 
              x={frameInset - 1} 
              y={frameInset - 1} 
              width={svgWidth - (frameInset * 2) + 2} 
              height={svgHeight - (frameInset * 2) + 2} 
              fill="none" 
              className="window-casement" 
            />
            
            {/* Inner border 50mm wide */}
            <rect 
              x={frameInset + innerBorderWidth} 
              y={frameInset + innerBorderWidth} 
              width={svgWidth - ((frameInset + innerBorderWidth) * 2)} 
              height={svgHeight - ((frameInset + innerBorderWidth) * 2)} 
              fill="none" 
              stroke="#334155" 
              strokeWidth="1" 
              strokeDasharray="1,1"
            />
            
            {/* Hinge indicators based on which casements can open */}
            {(openableCasements === "left" || openableCasements === "both") && (
              renderHingeIndicator(
                frameInset, 
                frameInset, 
                svgWidth - (frameInset * 2), 
                svgHeight - (frameInset * 2), 
                'left'
              )
            )}
            
            {(openableCasements === "right" || openableCasements === "both") && (
              renderHingeIndicator(
                frameInset, 
                frameInset, 
                svgWidth - (frameInset * 2), 
                svgHeight - (frameInset * 2), 
                'right'
              )
            )}
          </>
        );
      
      case "double":
        return (
          <>
            {/* Main frame */}
            <rect x="0" y="0" width={svgWidth} height={svgHeight} className="window-frame" />
            

            
            {/* Single glass pane */}
            <rect 
              x={frameInset} 
              y={frameInset} 
              width={svgWidth - (frameInset * 2)} 
              height={svgHeight - (frameInset * 2)} 
              fill={glassColor} 
              stroke="#94a3b8" 
              strokeWidth="1" 
            />
            
            {/* Georgian bars for entire window */}
            {renderGeorgianBars(
              frameInset,
              frameInset,
              svgWidth - (frameInset * 2),
              svgHeight - (frameInset * 2)
            )}
            
            {/* Transom for entire window */}
            {renderTransom(
              frameInset,
              frameInset,
              svgWidth - (frameInset * 2)
            )}
            
            {/* Left casement */}
            <rect 
              x={frameInset - 1} 
              y={frameInset - 1} 
              width={(svgWidth / 2) - frameInset - (frameThickness / 2) + 2} 
              height={svgHeight - (frameInset * 2) + 2} 
              fill="none" 
              className="window-casement" 
            />
            
            {/* Left casement inner border 50mm wide */}
            <rect 
              x={frameInset + innerBorderWidth} 
              y={frameInset + innerBorderWidth} 
              width={(svgWidth / 2) - frameInset - (frameThickness / 2) - (innerBorderWidth * 2) + 2} 
              height={svgHeight - ((frameInset + innerBorderWidth) * 2)} 
              fill="none" 
              stroke="#334155" 
              strokeWidth="1" 
              strokeDasharray="1,1"
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
            
            {/* Right casement inner border 50mm wide */}
            <rect 
              x={(svgWidth / 2) + (frameThickness / 2) + innerBorderWidth} 
              y={frameInset + innerBorderWidth} 
              width={(svgWidth / 2) - frameInset - (frameThickness / 2) - (innerBorderWidth * 2) + 2} 
              height={svgHeight - ((frameInset + innerBorderWidth) * 2)} 
              fill="none" 
              stroke="#334155" 
              strokeWidth="1" 
              strokeDasharray="1,1"
            />
            
            {/* Hinge indicators for left and right casements */}
            {(openableCasements === "left" || openableCasements === "both") && (
              renderHingeIndicator(
                frameInset, 
                frameInset, 
                (svgWidth / 2) - frameInset - (frameThickness / 2), 
                svgHeight - (frameInset * 2), 
                'left'
              )
            )}
            
            {(openableCasements === "right" || openableCasements === "both") && (
              renderHingeIndicator(
                (svgWidth / 2) + (frameThickness / 2), 
                frameInset, 
                (svgWidth / 2) - frameInset - (frameThickness / 2), 
                svgHeight - (frameInset * 2), 
                'right'
              )
            )}
          </>
        );
      
      case "triple":
        return (
          <>
            {/* Frame */}
            <rect x="0" y="0" width={svgWidth} height={svgHeight} className="window-frame" />
            

            
            {/* Single glass pane */}
            <rect 
              x={frameInset} 
              y={frameInset} 
              width={svgWidth - (frameInset * 2)} 
              height={svgHeight - (frameInset * 2)} 
              fill={glassColor} 
              stroke="#94a3b8" 
              strokeWidth="1" 
            />
            
            {/* Georgian bars for entire window */}
            {renderGeorgianBars(
              frameInset,
              frameInset,
              svgWidth - (frameInset * 2),
              svgHeight - (frameInset * 2)
            )}
            
            {/* Transom for entire window */}
            {renderTransom(
              frameInset,
              frameInset,
              svgWidth - (frameInset * 2)
            )}
            
            {/* Casements for each section */}
            <rect 
              x={frameInset - 1} 
              y={frameInset - 1} 
              width={(svgWidth / 3) - frameInset - (frameThickness / 2) + 2} 
              height={svgHeight - (frameInset * 2) + 2} 
              fill="none" 
              className="window-casement" 
            />
            
            {/* Left casement inner border 50mm wide */}
            <rect 
              x={frameInset + innerBorderWidth} 
              y={frameInset + innerBorderWidth} 
              width={(svgWidth / 3) - frameInset - (frameThickness / 2) - (innerBorderWidth * 2) + 2} 
              height={svgHeight - ((frameInset + innerBorderWidth) * 2)} 
              fill="none" 
              stroke="#334155" 
              strokeWidth="1" 
              strokeDasharray="1,1"
            />
            
            <rect 
              x={(svgWidth / 3) + (frameThickness / 2) - 1} 
              y={frameInset - 1} 
              width={(svgWidth / 3) - frameThickness + 2} 
              height={svgHeight - (frameInset * 2) + 2} 
              fill="none" 
              className="window-casement" 
            />
            
            {/* Middle casement inner border 50mm wide */}
            <rect 
              x={(svgWidth / 3) + (frameThickness / 2) + innerBorderWidth} 
              y={frameInset + innerBorderWidth} 
              width={(svgWidth / 3) - frameThickness - (innerBorderWidth * 2) + 2} 
              height={svgHeight - ((frameInset + innerBorderWidth) * 2)} 
              fill="none" 
              stroke="#334155" 
              strokeWidth="1" 
              strokeDasharray="1,1"
            />
            
            <rect 
              x={((svgWidth / 3) * 2) + (frameThickness / 2) - 1} 
              y={frameInset - 1} 
              width={(svgWidth / 3) - frameInset - (frameThickness / 2) + 2} 
              height={svgHeight - (frameInset * 2) + 2} 
              fill="none" 
              className="window-casement" 
            />
            
            {/* Right casement inner border 50mm wide */}
            <rect 
              x={((svgWidth / 3) * 2) + (frameThickness / 2) + innerBorderWidth} 
              y={frameInset + innerBorderWidth} 
              width={(svgWidth / 3) - frameInset - (frameThickness / 2) - (innerBorderWidth * 2) + 2} 
              height={svgHeight - ((frameInset + innerBorderWidth) * 2)} 
              fill="none" 
              stroke="#334155" 
              strokeWidth="1" 
              strokeDasharray="1,1"
            />
            
            {/* Hinge indicators for each casement */}
            {(openableCasements === "left" || openableCasements === "both") && (
              renderHingeIndicator(
                frameInset, 
                frameInset, 
                (svgWidth / 3) - frameInset - (frameThickness / 2), 
                svgHeight - (frameInset * 2), 
                'left'
              )
            )}
            
            {/* Middle casement is fixed by default, so no hinges */}
            
            {(openableCasements === "right" || openableCasements === "both") && (
              renderHingeIndicator(
                ((svgWidth / 3) * 2) + (frameThickness / 2), 
                frameInset, 
                (svgWidth / 3) - frameInset - (frameThickness / 2), 
                svgHeight - (frameInset * 2), 
                'right'
              )
            )}

          </>
        );
        
      case "patio":
        return (
          <>
            {/* Frame */}
            <rect x="0" y="0" width={svgWidth} height={svgHeight} className="window-frame" />
            

            
            {/* Single glass pane */}
            <rect 
              x={frameInset} 
              y={frameInset} 
              width={svgWidth - (frameInset * 2)} 
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
            
            {/* Left casement inner border 50mm wide */}
            <rect 
              x={frameInset + innerBorderWidth} 
              y={frameInset + innerBorderWidth} 
              width={(svgWidth / 2) - frameInset - (frameThickness / 2) - (innerBorderWidth * 2) + 2} 
              height={svgHeight - ((frameInset + innerBorderWidth) * 2)} 
              fill="none" 
              stroke="#334155" 
              strokeWidth="1" 
              strokeDasharray="1,1"
            />
            
            <rect 
              x={(svgWidth / 2) + (frameThickness / 2) - 1} 
              y={frameInset - 1} 
              width={(svgWidth / 2) - frameInset - (frameThickness / 2) + 2} 
              height={svgHeight - (frameInset * 2) + 2} 
              fill="none" 
              className="window-casement" 
            />
            
            {/* Right casement inner border 50mm wide */}
            <rect 
              x={(svgWidth / 2) + (frameThickness / 2) + innerBorderWidth} 
              y={frameInset + innerBorderWidth} 
              width={(svgWidth / 2) - frameInset - (frameThickness / 2) - (innerBorderWidth * 2) + 2} 
              height={svgHeight - ((frameInset + innerBorderWidth) * 2)} 
              fill="none" 
              stroke="#334155" 
              strokeWidth="1" 
              strokeDasharray="1,1"
            />
            
            {/* Door handles - bigger for visibility */}
            <circle cx={svgWidth * 0.45} cy={svgHeight * 0.5} r={3} fill="#334155" />
            <circle cx={svgWidth * 0.55} cy={svgHeight * 0.5} r={3} fill="#334155" />
            
            {/* Hinge indicators for patio doors */}
            {(openableCasements === "left" || openableCasements === "both") && (
              renderHingeIndicator(
                frameInset, 
                frameInset, 
                (svgWidth / 2) - frameInset - (frameThickness / 2), 
                svgHeight - (frameInset * 2), 
                'left'
              )
            )}
            
            {(openableCasements === "right" || openableCasements === "both") && (
              renderHingeIndicator(
                (svgWidth / 2) + (frameThickness / 2), 
                frameInset, 
                (svgWidth / 2) - frameInset - (frameThickness / 2), 
                svgHeight - (frameInset * 2), 
                'right'
              )
            )}
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
            
            {/* Opening indication - arrow pointing to hinge side */}
            <line 
              x1={svgWidth * 0.15} 
              y1={svgHeight * 0.5} 
              x2={svgWidth * 0.85} 
              y2={svgHeight * 0.5} 
              className="window-hinge" 
            />
            <line 
              x1={svgWidth * 0.15} 
              y1={svgHeight * 0.5} 
              x2={svgWidth * 0.4} 
              y2={svgHeight * 0.25} 
              className="window-hinge" 
            />
            <line 
              x1={svgWidth * 0.15} 
              y1={svgHeight * 0.5} 
              x2={svgWidth * 0.4} 
              y2={svgHeight * 0.75} 
              className="window-hinge" 
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
          
          {/* Window Name label */}
          <text 
            x={svgWidth / 2} 
            y={svgHeight + 50} 
            textAnchor="middle" 
            fontSize="11" 
            fontWeight="500" 
            fill="#334155"
          >
            {name}
          </text>
          
          {/* Glass type indication if obscure */}
          {false && (
            <text 
              x={svgWidth / 2} 
              y={svgHeight - 10} 
              textAnchor="middle" 
              fontSize="8" 
              fill="#334155"
            >
              Glass
            </text>
          )}
        </svg>
      </div>
    </div>
  );
}
