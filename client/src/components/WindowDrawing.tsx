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
    glassType, 
    openableCasements = "left", // Default left casement opens
    hasGeorgianBars = false,
    georgianBarsHorizontal = 1,
    georgianBarsVertical = 1,
    transomHeight = 400, // Default transom height 400mm
    topCasementsOpenable = "none" // Default no top casements open
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
  
  // Determine if using obscure glass
  const isObscureGlass = glassType === "Obscure" || glassType === "Tinted";
  const glassColor = isObscureGlass ? "#e6f0fa" : "#dbeafe"; // Slightly different blue for obscure glass
  
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
            
            {/* Glass */}
            <rect 
              x={frameInset} 
              y={frameInset} 
              width={svgWidth - (frameInset * 2)} 
              height={svgHeight - (frameInset * 2)} 
              fill="none" 
              stroke="none" 
            />
            
            {/* Georgian bars if enabled */}
            {renderGeorgianBars(
              frameInset,
              frameInset,
              svgWidth - (frameInset * 2),
              svgHeight - (frameInset * 2)
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
            
            {/* Inner border 50mm wide with light blue fill */}
            <rect 
              x={frameInset + innerBorderWidth} 
              y={frameInset + innerBorderWidth} 
              width={svgWidth - ((frameInset + innerBorderWidth) * 2)} 
              height={svgHeight - ((frameInset + innerBorderWidth) * 2)} 
              className="window-casement-interior"
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
      
      case "single-transom":
        // Calculate the scaled transom height, default to 400mm if not specified
        const scaledTransomHeight = (transomHeight ?? 400) * scaleFactor;
        
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
              fill="none" 
              stroke="none" 
            />
            
            {/* Horizontal transom bar - position based on transom height parameter */}
            <rect 
              x={frameInset} 
              y={frameInset + scaledTransomHeight} 
              width={svgWidth - (frameInset * 2)} 
              height={mullionThickness} 
              className="window-mullion" 
            />
            
            {/* Upper fixed casement - height based on transom height parameter */}
            <rect 
              x={frameInset - 1} 
              y={frameInset - 1} 
              width={svgWidth - (frameInset * 2) + 2} 
              height={scaledTransomHeight + 1} 
              fill="none" 
              className="window-casement" 
            />
            
            {/* Upper casement inner border 50mm wide with light blue fill */}
            <rect 
              x={frameInset + innerBorderWidth} 
              y={frameInset + innerBorderWidth} 
              width={svgWidth - ((frameInset + innerBorderWidth) * 2)} 
              height={scaledTransomHeight - (innerBorderWidth * 2)} 
              className="window-casement-interior"
            />
            
            {/* Lower opening casement - position based on transom height parameter */}
            <rect 
              x={frameInset - 1} 
              y={frameInset + scaledTransomHeight + mullionThickness - 1} 
              width={svgWidth - (frameInset * 2) + 2} 
              height={svgHeight - frameInset - scaledTransomHeight - mullionThickness} 
              fill="none" 
              className="window-casement" 
            />
            
            {/* Lower casement inner border 50mm wide with light blue fill */}
            <rect 
              x={frameInset + innerBorderWidth} 
              y={frameInset + scaledTransomHeight + mullionThickness + innerBorderWidth} 
              width={svgWidth - ((frameInset + innerBorderWidth) * 2)} 
              height={svgHeight - frameInset - scaledTransomHeight - mullionThickness - innerBorderWidth * 2} 
              className="window-casement-interior"
            />
            
            {/* Georgian bars if enabled */}
            {renderGeorgianBars(
              frameInset,
              frameInset,
              svgWidth - (frameInset * 2),
              svgHeight - (frameInset * 2)
            )}
            
            {/* Hinge indicators for the top casement - with hinges at the top */}
            {(topCasementsOpenable === "left" || topCasementsOpenable === "both") && (
              <>
                {/* Left top casement - hinged at top */}
                <path 
                  d={`M ${frameInset + 20} ${frameInset + scaledTransomHeight - 20} 
                      L ${frameInset + (svgWidth/4)} ${frameInset + 20} 
                      L ${svgWidth/2 - 20} ${frameInset + scaledTransomHeight - 20}`}
                  stroke="black" 
                  strokeDasharray="5,5" 
                  strokeWidth="1"
                  fill="none"
                />
                <circle cx={frameInset + (svgWidth/6)} cy={frameInset + 5} r={2} fill="black" />
                <circle cx={frameInset + (svgWidth/3)} cy={frameInset + 5} r={2} fill="black" />
              </>
            )}
            
            {(topCasementsOpenable === "right" || topCasementsOpenable === "both") && (
              <>
                {/* Right top casement - hinged at top */}
                <path 
                  d={`M ${svgWidth/2 + 20} ${frameInset + scaledTransomHeight - 20} 
                      L ${frameInset + (svgWidth*3/4)} ${frameInset + 20} 
                      L ${svgWidth - frameInset - 20} ${frameInset + scaledTransomHeight - 20}`}
                  stroke="black" 
                  strokeDasharray="5,5" 
                  strokeWidth="1"
                  fill="none"
                />
                <circle cx={frameInset + (svgWidth*2/3)} cy={frameInset + 5} r={2} fill="black" />
                <circle cx={frameInset + (svgWidth*5/6)} cy={frameInset + 5} r={2} fill="black" />
              </>
            )}
            
            {/* Hinge indicators for the lower casement */}
            {(openableCasements === "left" || openableCasements === "both") && (
              renderHingeIndicator(
                frameInset, 
                frameInset + scaledTransomHeight + mullionThickness, 
                svgWidth - (frameInset * 2), 
                svgHeight - frameInset - scaledTransomHeight - mullionThickness, 
                'left'
              )
            )}
            
            {(openableCasements === "right" || openableCasements === "both") && (
              renderHingeIndicator(
                frameInset, 
                frameInset + scaledTransomHeight + mullionThickness, 
                svgWidth - (frameInset * 2), 
                svgHeight - frameInset - scaledTransomHeight - mullionThickness, 
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
              fill="none" 
              stroke="none" 
            />
            
            {/* Georgian bars for entire window */}
            {renderGeorgianBars(
              frameInset,
              frameInset,
              svgWidth - (frameInset * 2),
              svgHeight - (frameInset * 2)
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
            
            {/* Left casement inner border 50mm wide with light blue fill */}
            <rect 
              x={frameInset + innerBorderWidth} 
              y={frameInset + innerBorderWidth} 
              width={(svgWidth / 2) - frameInset - (frameThickness / 2) - (innerBorderWidth * 2) + 2} 
              height={svgHeight - ((frameInset + innerBorderWidth) * 2)} 
              className="window-casement-interior"
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
            
            {/* Right casement inner border 50mm wide with light blue fill */}
            <rect 
              x={(svgWidth / 2) + (frameThickness / 2) + innerBorderWidth} 
              y={frameInset + innerBorderWidth} 
              width={(svgWidth / 2) - frameInset - (frameThickness / 2) - (innerBorderWidth * 2) + 2} 
              height={svgHeight - ((frameInset + innerBorderWidth) * 2)} 
              className="window-casement-interior"
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
        
      case "double-transom":
        return (
          <>
            {/* Main frame */}
            <rect x="0" y="0" width={svgWidth} height={svgHeight} className="window-frame" />
            
            {/* Glass */}
            <rect 
              x={frameInset} 
              y={frameInset} 
              width={svgWidth - (frameInset * 2)} 
              height={svgHeight - (frameInset * 2)} 
              fill="none" 
              stroke="none" 
            />
            
            {/* Vertical mullion in the middle */}
            <rect 
              x={(svgWidth / 2) - (mullionThickness / 2)} 
              y={frameInset} 
              width={mullionThickness} 
              height={svgHeight - (frameInset * 2)} 
              className="window-mullion" 
            />
            
            {/* Horizontal transom bar - fixed at top 1/3 of the window */}
            <rect 
              x={frameInset} 
              y={frameInset + (svgHeight / 3)} 
              width={svgWidth - (frameInset * 2)} 
              height={mullionThickness} 
              className="window-mullion" 
            />
            
            {/* Upper left fixed casement */}
            <rect 
              x={frameInset - 1} 
              y={frameInset - 1} 
              width={(svgWidth / 2) - frameInset - (mullionThickness / 2) + 1} 
              height={(svgHeight / 3) + 1} 
              fill="none" 
              className="window-casement" 
            />
            
            {/* Upper left casement inner border with light blue fill */}
            <rect 
              x={frameInset + innerBorderWidth} 
              y={frameInset + innerBorderWidth} 
              width={(svgWidth / 2) - frameInset - (mullionThickness / 2) - (innerBorderWidth * 2)} 
              height={(svgHeight / 3) - (innerBorderWidth * 2)} 
              className="window-casement-interior"
            />
            
            {/* Upper right fixed casement */}
            <rect 
              x={(svgWidth / 2) + (mullionThickness / 2)} 
              y={frameInset - 1} 
              width={(svgWidth / 2) - frameInset - (mullionThickness / 2) + 1} 
              height={(svgHeight / 3) + 1} 
              fill="none" 
              className="window-casement" 
            />
            
            {/* Upper right casement inner border with light blue fill */}
            <rect 
              x={(svgWidth / 2) + (mullionThickness / 2) + innerBorderWidth} 
              y={frameInset + innerBorderWidth} 
              width={(svgWidth / 2) - frameInset - (mullionThickness / 2) - (innerBorderWidth * 2)} 
              height={(svgHeight / 3) - (innerBorderWidth * 2)} 
              className="window-casement-interior"
            />
            
            {/* Lower left opening casement */}
            <rect 
              x={frameInset - 1} 
              y={frameInset + (svgHeight / 3) + mullionThickness - 1} 
              width={(svgWidth / 2) - frameInset - (mullionThickness / 2) + 1} 
              height={svgHeight - frameInset - (svgHeight / 3) - mullionThickness} 
              fill="none" 
              className="window-casement" 
            />
            
            {/* Lower left casement inner border with light blue fill */}
            <rect 
              x={frameInset + innerBorderWidth} 
              y={frameInset + (svgHeight / 3) + mullionThickness + innerBorderWidth} 
              width={(svgWidth / 2) - frameInset - (mullionThickness / 2) - (innerBorderWidth * 2)} 
              height={svgHeight - frameInset - (svgHeight / 3) - mullionThickness - (innerBorderWidth * 2)} 
              className="window-casement-interior"
            />
            
            {/* Lower right opening casement */}
            <rect 
              x={(svgWidth / 2) + (mullionThickness / 2)} 
              y={frameInset + (svgHeight / 3) + mullionThickness - 1} 
              width={(svgWidth / 2) - frameInset - (mullionThickness / 2) + 1} 
              height={svgHeight - frameInset - (svgHeight / 3) - mullionThickness} 
              fill="none" 
              className="window-casement" 
            />
            
            {/* Lower right casement inner border with light blue fill */}
            <rect 
              x={(svgWidth / 2) + (mullionThickness / 2) + innerBorderWidth} 
              y={frameInset + (svgHeight / 3) + mullionThickness + innerBorderWidth} 
              width={(svgWidth / 2) - frameInset - (mullionThickness / 2) - (innerBorderWidth * 2)} 
              height={svgHeight - frameInset - (svgHeight / 3) - mullionThickness - (innerBorderWidth * 2)} 
              className="window-casement-interior"
            />
            
            {/* Georgian bars if enabled */}
            {renderGeorgianBars(
              frameInset,
              frameInset,
              svgWidth - (frameInset * 2),
              svgHeight - (frameInset * 2)
            )}
            
            {/* Hinge indicators for the lower casements */}
            {(openableCasements === "left" || openableCasements === "both") && (
              renderHingeIndicator(
                frameInset, 
                frameInset + (svgHeight / 3) + mullionThickness, 
                (svgWidth / 2) - frameInset - (mullionThickness / 2), 
                (svgHeight * 2/3) - frameInset - mullionThickness, 
                'left'
              )
            )}
            
            {(openableCasements === "right" || openableCasements === "both") && (
              renderHingeIndicator(
                (svgWidth / 2) + (mullionThickness / 2), 
                frameInset + (svgHeight / 3) + mullionThickness, 
                (svgWidth / 2) - frameInset - (mullionThickness / 2), 
                (svgHeight * 2/3) - frameInset - mullionThickness, 
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
              fill="none" 
              stroke="none" 
            />
            
            {/* Georgian bars for entire window */}
            {renderGeorgianBars(
              frameInset,
              frameInset,
              svgWidth - (frameInset * 2),
              svgHeight - (frameInset * 2)
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
            
            {/* Left casement inner border 50mm wide with light blue fill */}
            <rect 
              x={frameInset + innerBorderWidth} 
              y={frameInset + innerBorderWidth} 
              width={(svgWidth / 3) - frameInset - (frameThickness / 2) - (innerBorderWidth * 2) + 2} 
              height={svgHeight - ((frameInset + innerBorderWidth) * 2)} 
              className="window-casement-interior"
            />
            
            <rect 
              x={(svgWidth / 3) + (frameThickness / 2) - 1} 
              y={frameInset - 1} 
              width={(svgWidth / 3) - frameThickness + 2} 
              height={svgHeight - (frameInset * 2) + 2} 
              fill="none" 
              className="window-casement" 
            />
            
            {/* Middle casement inner border 50mm wide with light blue fill */}
            <rect 
              x={(svgWidth / 3) + (frameThickness / 2) + innerBorderWidth} 
              y={frameInset + innerBorderWidth} 
              width={(svgWidth / 3) - frameThickness - (innerBorderWidth * 2) + 2} 
              height={svgHeight - ((frameInset + innerBorderWidth) * 2)} 
              className="window-casement-interior"
            />
            
            <rect 
              x={((svgWidth / 3) * 2) + (frameThickness / 2) - 1} 
              y={frameInset - 1} 
              width={(svgWidth / 3) - frameInset - (frameThickness / 2) + 2} 
              height={svgHeight - (frameInset * 2) + 2} 
              fill="none" 
              className="window-casement" 
            />
            
            {/* Right casement inner border 50mm wide with light blue fill */}
            <rect 
              x={((svgWidth / 3) * 2) + (frameThickness / 2) + innerBorderWidth} 
              y={frameInset + innerBorderWidth} 
              width={(svgWidth / 3) - frameInset - (frameThickness / 2) - (innerBorderWidth * 2) + 2} 
              height={svgHeight - ((frameInset + innerBorderWidth) * 2)} 
              className="window-casement-interior"
            />
            
            {/* Mullions (vertical dividers between sections) */}
            <rect 
              x={(svgWidth / 3) - (mullionThickness / 2)} 
              y={frameInset} 
              width={mullionThickness} 
              height={svgHeight - (frameInset * 2)} 
              className="window-mullion" 
            />
            
            <rect 
              x={((svgWidth / 3) * 2) - (mullionThickness / 2)} 
              y={frameInset} 
              width={mullionThickness} 
              height={svgHeight - (frameInset * 2)} 
              className="window-mullion" 
            />
            
            {/* Hinge indicators for left and right sections */}
            {(openableCasements === "left" || openableCasements === "both") && (
              renderHingeIndicator(
                frameInset, 
                frameInset, 
                (svgWidth / 3) - frameInset - (frameThickness / 2), 
                svgHeight - (frameInset * 2), 
                'left'
              )
            )}
            
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
        
      case "triple-transom":
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
              fill="none" 
              stroke="none" 
            />
            
            {/* Vertical mullions */}
            <rect 
              x={(svgWidth / 3) - (mullionThickness / 2)} 
              y={frameInset} 
              width={mullionThickness} 
              height={svgHeight - (frameInset * 2)} 
              className="window-mullion" 
            />
            
            <rect 
              x={((svgWidth / 3) * 2) - (mullionThickness / 2)} 
              y={frameInset} 
              width={mullionThickness} 
              height={svgHeight - (frameInset * 2)} 
              className="window-mullion" 
            />
            
            {/* Horizontal transom bar - fixed at top 1/3 of the window */}
            <rect 
              x={frameInset} 
              y={frameInset + (svgHeight / 3)} 
              width={svgWidth - (frameInset * 2)} 
              height={mullionThickness} 
              className="window-mullion" 
            />
            
            {/* Upper left fixed casement */}
            <rect 
              x={frameInset - 1} 
              y={frameInset - 1} 
              width={(svgWidth / 3) - frameInset - (frameThickness / 2) + 1} 
              height={(svgHeight / 3) + 1} 
              fill="none" 
              className="window-casement" 
            />
            
            {/* Upper left casement inner border with light blue fill */}
            <rect 
              x={frameInset + innerBorderWidth} 
              y={frameInset + innerBorderWidth} 
              width={(svgWidth / 3) - frameInset - (frameThickness / 2) - (innerBorderWidth * 2) + 1} 
              height={(svgHeight / 3) - (innerBorderWidth * 2)} 
              className="window-casement-interior"
            />
            
            {/* Upper middle fixed casement */}
            <rect 
              x={(svgWidth / 3) + (mullionThickness / 2)} 
              y={frameInset - 1} 
              width={(svgWidth / 3) - mullionThickness} 
              height={(svgHeight / 3) + 1} 
              fill="none" 
              className="window-casement" 
            />
            
            {/* Upper middle casement inner border with light blue fill */}
            <rect 
              x={(svgWidth / 3) + (mullionThickness / 2) + innerBorderWidth} 
              y={frameInset + innerBorderWidth} 
              width={(svgWidth / 3) - mullionThickness - (innerBorderWidth * 2)} 
              height={(svgHeight / 3) - (innerBorderWidth * 2)} 
              className="window-casement-interior"
            />
            
            {/* Upper right fixed casement */}
            <rect 
              x={((svgWidth / 3) * 2) + (mullionThickness / 2)} 
              y={frameInset - 1} 
              width={(svgWidth / 3) - frameInset - (mullionThickness / 2) + 1} 
              height={(svgHeight / 3) + 1} 
              fill="none" 
              className="window-casement" 
            />
            
            {/* Upper right casement inner border with light blue fill */}
            <rect 
              x={((svgWidth / 3) * 2) + (mullionThickness / 2) + innerBorderWidth} 
              y={frameInset + innerBorderWidth} 
              width={(svgWidth / 3) - frameInset - (mullionThickness / 2) - (innerBorderWidth * 2) + 1} 
              height={(svgHeight / 3) - (innerBorderWidth * 2)} 
              className="window-casement-interior"
            />
            
            {/* Lower left opening casement */}
            <rect 
              x={frameInset - 1} 
              y={frameInset + (svgHeight / 3) + mullionThickness - 1} 
              width={(svgWidth / 3) - frameInset - (frameThickness / 2) + 1} 
              height={(svgHeight * 2/3) - frameInset - mullionThickness + 1} 
              fill="none" 
              className="window-casement" 
            />
            
            {/* Lower left casement inner border with light blue fill */}
            <rect 
              x={frameInset + innerBorderWidth} 
              y={frameInset + (svgHeight / 3) + mullionThickness + innerBorderWidth} 
              width={(svgWidth / 3) - frameInset - (frameThickness / 2) - (innerBorderWidth * 2) + 1} 
              height={(svgHeight * 2/3) - frameInset - mullionThickness - (innerBorderWidth * 2) + 1} 
              className="window-casement-interior"
            />
            
            {/* Lower middle fixed casement */}
            <rect 
              x={(svgWidth / 3) + (mullionThickness / 2)} 
              y={frameInset + (svgHeight / 3) + mullionThickness - 1} 
              width={(svgWidth / 3) - mullionThickness} 
              height={(svgHeight * 2/3) - frameInset - mullionThickness + 1} 
              fill="none" 
              className="window-casement" 
            />
            
            {/* Lower middle casement inner border with light blue fill */}
            <rect 
              x={(svgWidth / 3) + (mullionThickness / 2) + innerBorderWidth} 
              y={frameInset + (svgHeight / 3) + mullionThickness + innerBorderWidth} 
              width={(svgWidth / 3) - mullionThickness - (innerBorderWidth * 2)} 
              height={(svgHeight * 2/3) - frameInset - mullionThickness - (innerBorderWidth * 2) + 1} 
              className="window-casement-interior"
            />
            
            {/* Lower right opening casement */}
            <rect 
              x={((svgWidth / 3) * 2) + (mullionThickness / 2)} 
              y={frameInset + (svgHeight / 3) + mullionThickness - 1} 
              width={(svgWidth / 3) - frameInset - (mullionThickness / 2) + 1} 
              height={(svgHeight * 2/3) - frameInset - mullionThickness + 1} 
              fill="none" 
              className="window-casement" 
            />
            
            {/* Lower right casement inner border with light blue fill */}
            <rect 
              x={((svgWidth / 3) * 2) + (mullionThickness / 2) + innerBorderWidth} 
              y={frameInset + (svgHeight / 3) + mullionThickness + innerBorderWidth} 
              width={(svgWidth / 3) - frameInset - (mullionThickness / 2) - (innerBorderWidth * 2) + 1} 
              height={(svgHeight * 2/3) - frameInset - mullionThickness - (innerBorderWidth * 2) + 1} 
              className="window-casement-interior"
            />
            
            {/* Georgian bars if enabled */}
            {renderGeorgianBars(
              frameInset,
              frameInset,
              svgWidth - (frameInset * 2),
              svgHeight - (frameInset * 2)
            )}
            
            {/* Hinge indicators for the lower left and right casements */}
            {(openableCasements === "left" || openableCasements === "both") && (
              renderHingeIndicator(
                frameInset, 
                frameInset + (svgHeight / 3) + mullionThickness, 
                (svgWidth / 3) - frameInset - (frameThickness / 2), 
                (svgHeight * 2/3) - frameInset - mullionThickness, 
                'left'
              )
            )}
            
            {(openableCasements === "right" || openableCasements === "both") && (
              renderHingeIndicator(
                ((svgWidth / 3) * 2) + (mullionThickness / 2), 
                frameInset + (svgHeight / 3) + mullionThickness, 
                (svgWidth / 3) - frameInset - (frameThickness / 2), 
                (svgHeight * 2/3) - frameInset - mullionThickness, 
                'right'
              )
            )}
          </>
        );
        
      case "slider":
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
              fill="none" 
              stroke="none" 
            />
            
            {/* Georgian bars for entire window */}
            {renderGeorgianBars(
              frameInset,
              frameInset,
              svgWidth - (frameInset * 2),
              svgHeight - (frameInset * 2)
            )}
            
            {/* Mullion in the middle */}
            <rect 
              x={(svgWidth / 2) - (mullionThickness / 2)} 
              y={frameInset} 
              width={mullionThickness} 
              height={svgHeight - (frameInset * 2)} 
              className="window-mullion" 
            />
            
            {/* Left slider (fixed) */}
            <rect 
              x={frameInset - 1} 
              y={frameInset - 1} 
              width={(svgWidth / 2) - frameInset - (mullionThickness / 2) + 1} 
              height={svgHeight - (frameInset * 2) + 2}
              fill="none" 
              className="window-casement" 
            />
            
            {/* Left casement inner border 50mm wide with light blue fill */}
            <rect 
              x={frameInset + innerBorderWidth} 
              y={frameInset + innerBorderWidth} 
              width={(svgWidth / 2) - frameInset - (mullionThickness / 2) - innerBorderWidth} 
              height={svgHeight - ((frameInset + innerBorderWidth) * 2)} 
              className="window-casement-interior"
            />
            
            {/* Right slider (sliding part) */}
            <rect 
              x={(svgWidth / 2) + (mullionThickness / 2)} 
              y={frameInset - 1}  
              width={(svgWidth / 2) - frameInset - (mullionThickness / 2) + 1} 
              height={svgHeight - (frameInset * 2) + 2} 
              fill="none" 
              className="window-casement" 
            />
            
            {/* Right casement inner border 50mm wide with light blue fill */}
            <rect 
              x={(svgWidth / 2) + (mullionThickness / 2) + innerBorderWidth} 
              y={frameInset + innerBorderWidth} 
              width={(svgWidth / 2) - frameInset - (mullionThickness / 2) - innerBorderWidth} 
              height={svgHeight - ((frameInset + innerBorderWidth) * 2)} 
              className="window-casement-interior"
            />
            
            {/* Arrow indicating slider direction */}
            <line 
              x1={(svgWidth / 2) + (frameInset * 1.5)} 
              y1={svgHeight / 2} 
              x2={svgWidth - (frameInset * 1.5)} 
              y2={svgHeight / 2} 
              stroke="#334155" 
              strokeWidth="1.5" 
            />
            
            {/* Arrow heads */}
            <polyline 
              points={`${(svgWidth / 2) + (frameInset * 1.5)},${(svgHeight / 2) - 5} ${(svgWidth / 2) + (frameInset * 1.5)},${svgHeight / 2} ${(svgWidth / 2) + (frameInset * 1.5)},${(svgHeight / 2) + 5}`} 
              stroke="#334155" 
              strokeWidth="1.5" 
              fill="none" 
            />
            
            <polyline 
              points={`${svgWidth - (frameInset * 1.5)},${(svgHeight / 2) - 5} ${svgWidth - (frameInset * 1.5)},${svgHeight / 2} ${svgWidth - (frameInset * 1.5)},${(svgHeight / 2) + 5}`} 
              stroke="#334155" 
              strokeWidth="1.5" 
              fill="none" 
            />
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="window-drawing">
      <svg 
        width={svgWidth + extraWidthForDimensions} 
        height={svgHeight + extraHeightForDimensions + extraHeightForLabel} 
        viewBox={`0 0 ${svgWidth + extraWidthForDimensions} ${svgHeight + extraHeightForDimensions + extraHeightForLabel}`}
        className="window-drawing-svg"
      >
        {/* Main window drawing, positioned with space for dimensions */}
        <g transform={`translate(0, 10)`}>
          {renderWindow()}
        </g>
        
        {/* Dimension line for width */}
        <line 
          x1="0" 
          y1={svgHeight + 20} 
          x2={svgWidth} 
          y2={svgHeight + 20} 
          stroke="black" 
          strokeWidth="1" 
        />
        
        {/* Dimension arrows */}
        <line 
          x1="0" 
          y1={svgHeight + 15} 
          x2="0" 
          y2={svgHeight + 25} 
          stroke="black" 
          strokeWidth="1" 
        />
        <line 
          x1={svgWidth} 
          y1={svgHeight + 15} 
          x2={svgWidth} 
          y2={svgHeight + 25} 
          stroke="black" 
          strokeWidth="1" 
        />
        
        {/* Width text */}
        <text 
          x={svgWidth / 2} 
          y={svgHeight + 35} 
          textAnchor="middle" 
          className="dimension-text"
        >
          {width}mm
        </text>
        
        {/* Dimension line for height on the right side */}
        <line 
          x1={svgWidth + 20} 
          y1="10" 
          x2={svgWidth + 20} 
          y2={svgHeight + 10} 
          stroke="black" 
          strokeWidth="1" 
        />
        
        {/* Dimension arrows for height */}
        <line 
          x1={svgWidth + 15} 
          y1="10" 
          x2={svgWidth + 25} 
          y2="10" 
          stroke="black" 
          strokeWidth="1" 
        />
        <line 
          x1={svgWidth + 15} 
          y1={svgHeight + 10} 
          x2={svgWidth + 25} 
          y2={svgHeight + 10} 
          stroke="black" 
          strokeWidth="1" 
        />
        
        {/* Height text vertical on the right */}
        <text 
          x={svgWidth + 35} 
          y={(svgHeight / 2) + 10} 
          textAnchor="middle" 
          className="dimension-text"
        >
          {height}mm
        </text>
        
        {/* Window label at bottom */}
        <text 
          x={svgWidth / 2} 
          y={svgHeight + extraHeightForDimensions + 10} 
          textAnchor="middle" 
          className="dimension-text" 
          fontWeight="bold"
        >
          {name}
        </text>
        
        {/* Window type label under name */}
        <text 
          x={svgWidth / 2} 
          y={svgHeight + extraHeightForDimensions + 22} 
          textAnchor="middle" 
          className="dimension-text"
          fontSize="8"
        >
          {windowConfig.name}
        </text>
      </svg>
    </div>
  );
}