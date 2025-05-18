import { useMemo } from "react";
import type { Window } from "@shared/schema";
import { windowTypes } from "@/lib/windowTypes";

interface WindowDrawingProps {
  window: Window;
}

export default function WindowDrawing({ window }: WindowDrawingProps) {
  // Create unique class name for this window for PDF export
  const windowClassName = `window-drawing-${window.id}`;
  const { 
    type, 
    width, 
    height, 
    name = "Window", // Provide default name to prevent rendering issues
    glassType, 
    openableCasements = "left", // Default left casement opens
    hasGeorgianBars = false,
    georgianBarsHorizontal = 1,
    georgianBarsVertical = 0,
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
    
    // Georgian bars are 25mm thick and white
    const barColor = "#ffffff";
    const georgianBarWidth = Math.max(2, Math.round(25 * scaleFactor)); // Scale 25mm to SVG size, minimum 2px
    
    // Create the bars
    const bars = [];
    
    // Calculate the effective casement area (excluding the frame)
    // This ensures the Georgian bars are positioned within the casement
    const casementInnerWidth = width;
    const casementInnerHeight = height;
    
    // Horizontal bars
    if (numHorizontalBars > 0) {
      // Create horizontal bars based on specified count
      const horizontalSpacing = casementInnerHeight / (numHorizontalBars + 1);
      for (let i = 1; i <= numHorizontalBars; i++) {
        const yPos = y + horizontalSpacing * i;
        bars.push(
          <rect 
            key={`h-${i}`}
            x={x} 
            y={yPos - georgianBarWidth/2} 
            width={casementInnerWidth} 
            height={georgianBarWidth} 
            fill={barColor} 
          />
        );
      }
    }
    
    // Vertical bars
    if (numVerticalBars > 0) {
      // Create vertical bars based on specified count
      const verticalSpacing = casementInnerWidth / (numVerticalBars + 1);
      for (let i = 1; i <= numVerticalBars; i++) {
        const xPos = x + verticalSpacing * i;
        bars.push(
          <rect 
            key={`v-${i}`}
            x={xPos - georgianBarWidth/2} 
            y={y} 
            width={georgianBarWidth} 
            height={casementInnerHeight} 
            fill={barColor} 
          />
        );
      }
    }
    
    return bars;
  };
  
  // Function to render dashed lines to indicate the hinge side for opening casements
  const renderHingeIndicator = (x: number, y: number, width: number, height: number, hingeSide: 'left' | 'right' | 'center') => {
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
    } else if (hingeSide === 'right') {
      // If hinges are on the right, line starts at top left, goes to middle right, then to bottom left
      startX = x;         // Top left corner X
      startY = y;         // Top left corner Y
      middleX = x + width; // Middle right X
      middleY = y + (height / 2); // Middle right Y
      endX = x;          // Bottom left corner X
      endY = y + height; // Bottom left corner Y
    } else if (hingeSide === 'center') {
      // If center opening (like a door), draw a vertical line down the middle
      startX = x + (width / 2); // Top middle X
      startY = y;              // Top middle Y
      middleX = x + (width / 2); // Middle X
      middleY = y + (height / 2); // Middle Y
      endX = x + (width / 2);   // Bottom middle X
      endY = y + height;       // Bottom Y
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
  

  
  // Function to render door designs
  const renderDoor = (doorType: string) => {
    // Door frame thickness - slightly thicker than windows
    const doorFrameThickness = Math.max(4, Math.round(55 * scaleFactor)); // 55mm scaled to SVG size
    const doorFrameInset = doorFrameThickness + 2;
    
    // Door panel styles
    const panelColor = "#ffffff"; // Wooden door color
    const panelStrokeColor = "#000000"; // Darker brown for panel edges
    const glassColor = "#dbeafe"; // Light blue for glass
    
    // Basic door frame that all doors share
    const doorFrame = (
      <>
        {/* Outer Frame */}
        <rect x="0" y="0" width={svgWidth} height={svgHeight} className="window-frame" />
        
        {/* Inner area */}
        <rect 
          x={doorFrameInset} 
          y={doorFrameInset} 
          width={svgWidth - (doorFrameInset * 2)} 
          height={svgHeight - (doorFrameInset * 2)} 
          fill={panelColor} 
          stroke={panelStrokeColor}
          strokeWidth="1"
        />
      </>
    );
    
    switch(doorType) {
      case "door-fully-boarded":
        return (
          <>
            {doorFrame}
            
            {/* Horizontal panels for fully boarded effect */}
            {Array.from({ length: 6 }).map((_, index) => {
              const panelHeight = (svgHeight - (doorFrameInset * 2)) / 6;
              const yPos = doorFrameInset + (index * panelHeight);
              
              return (
                <rect
                  key={`board-${index}`}
                  x={doorFrameInset}
                  y={yPos}
                  width={svgWidth - (doorFrameInset * 2)}
                  height={panelHeight}
                  fill={panelColor}
                  stroke={panelStrokeColor}
                  strokeWidth="0.5"
                />
              );
            })}
            
            {/* Door handle */}
            <circle
              cx={svgWidth - doorFrameInset - 15}
              cy={svgHeight / 2}
              r={4}
              fill="#888"
              stroke="#555"
              strokeWidth="1"
            />
          </>
        );
        
      case "door-full-glazed":
        return (
          <>
            {doorFrame}
            
            {/* Large glass panel */}
            <rect
              x={doorFrameInset + 20}
              y={doorFrameInset + 20}
              width={svgWidth - (doorFrameInset * 2) - 40}
              height={svgHeight - (doorFrameInset * 2) - 40}
              fill={glassColor}
              stroke={panelStrokeColor}
              strokeWidth="1"
            />
            
            {/* Door handle */}
            <circle
              cx={svgWidth - doorFrameInset - 15}
              cy={svgHeight / 2}
              r={4}
              fill="#888"
              stroke="#555"
              strokeWidth="1"
            />
          </>
        );
        
      case "door-half-glazed":
        return (
          <>
            {doorFrame}
            
            {/* Bottom half - wood panel */}
            <rect
              x={doorFrameInset}
              y={doorFrameInset + (svgHeight - doorFrameInset * 2) / 2}
              width={svgWidth - (doorFrameInset * 2)}
              height={(svgHeight - doorFrameInset * 2) / 2}
              fill={panelColor}
              stroke={panelStrokeColor}
              strokeWidth="1"
            />
            
            {/* Top half - glass panel */}
            <rect
              x={doorFrameInset + 15}
              y={doorFrameInset + 15}
              width={svgWidth - (doorFrameInset * 2) - 30}
              height={(svgHeight - doorFrameInset * 2) / 2 - 15}
              fill={glassColor}
              stroke={panelStrokeColor}
              strokeWidth="1"
            />
            
            {/* Door handle */}
            <circle
              cx={svgWidth - doorFrameInset - 15}
              cy={svgHeight / 2}
              r={4}
              fill="#888"
              stroke="#555"
              strokeWidth="1"
            />
          </>
        );
        
      case "door-6-panel":
        return (
          <>
            {doorFrame}
            
            {/* 6 panel layout - 2 columns by 3 rows */}
            {Array.from({ length: 6 }).map((_, index) => {
              const columnCount = 2;
              const rowCount = 3;
              
              const panelWidth = (svgWidth - (doorFrameInset * 2)) / columnCount;
              const panelHeight = (svgHeight - (doorFrameInset * 2)) / rowCount;
              
              const column = index % columnCount;
              const row = Math.floor(index / columnCount);
              
              const xPos = doorFrameInset + (column * panelWidth);
              const yPos = doorFrameInset + (row * panelHeight);
              
              // Add a small margin between panels
              const panelMargin = 4;
              
              return (
                <rect
                  key={`panel-${index}`}
                  x={xPos + panelMargin}
                  y={yPos + panelMargin}
                  width={panelWidth - (panelMargin * 2)}
                  height={panelHeight - (panelMargin * 2)}
                  fill={panelColor}
                  stroke={panelStrokeColor}
                  strokeWidth="1"
                  rx={2}
                  ry={2}
                />
              );
            })}
            
            {/* Door handle */}
            <circle
              cx={svgWidth - doorFrameInset - 15}
              cy={svgHeight / 2}
              r={4}
              fill="#888"
              stroke="#555"
              strokeWidth="1"
            />
          </>
        );
        
      default:
        return doorFrame;
    }
  };

  // Render the appropriate window or door based on type
  const renderWindow = () => {
    // Check if it's a door type
    if (windowConfig.category === "door") {
      return renderDoor(windowConfig.id);
    }
    
    // Otherwise it's a window type
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
              height={svgHeight - frameInset - 10 - scaledTransomHeight - mullionThickness} 
              fill="none" 
              className="window-casement" 
            />
            
            {/* Lower casement inner border 50mm wide with light blue fill */}
            <rect 
              x={frameInset + innerBorderWidth} 
              y={frameInset + scaledTransomHeight + mullionThickness + innerBorderWidth} 
              width={svgWidth - ((frameInset + innerBorderWidth) * 2)} 
              height={svgHeight - frameInset - scaledTransomHeight - 10 - mullionThickness - innerBorderWidth * 2} 
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
                  d={`M ${frameInset} ${frameInset + scaledTransomHeight - 5} 
                      L ${frameInset + (svgWidth/4)} ${frameInset} 
                      L ${svgWidth/2 - frameInset/2} ${frameInset + scaledTransomHeight - 5}`}
                  stroke="black" 
                  strokeDasharray="5,5" 
                  strokeWidth="1"
                  fill="none"
                />
              </>
            )}
            
            {(topCasementsOpenable === "right" || topCasementsOpenable === "both") && (
              <>
                {/* Right top casement - hinged at top */}
                <path 
                  d={`M ${svgWidth/2 + frameInset/2} ${frameInset + scaledTransomHeight - 5} 
                      L ${frameInset + (svgWidth*3/4)} ${frameInset} 
                      L ${svgWidth - frameInset} ${frameInset + scaledTransomHeight - 5}`}
                  stroke="black" 
                  strokeDasharray="5,5" 
                  strokeWidth="1"
                  fill="none"
                />
              </>
            )}
            
            {topCasementsOpenable === "center-left" && (
              <>
                {/* Center-left top casement - hinged at top */}
                <path 
                  d={`M ${svgWidth/2 - svgWidth/6} ${frameInset + scaledTransomHeight - 5} 
                      L ${svgWidth/2 - svgWidth/12} ${frameInset} 
                      L ${svgWidth/2} ${frameInset + scaledTransomHeight - 5}`}
                  stroke="black" 
                  strokeDasharray="5,5" 
                  strokeWidth="1"
                  fill="none"
                />
              </>
            )}
            
            {topCasementsOpenable === "center-right" && (
              <>
                {/* Center-right top casement - hinged at top */}
                <path 
                  d={`M ${svgWidth/2} ${frameInset + scaledTransomHeight - 5} 
                      L ${svgWidth/2 + svgWidth/12} ${frameInset} 
                      L ${svgWidth/2 + svgWidth/6} ${frameInset + scaledTransomHeight - 5}`}
                  stroke="black" 
                  strokeDasharray="5,5" 
                  strokeWidth="1"
                  fill="none"
                />
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
            
            {openableCasements === "center" && (
              renderHingeIndicator(
                frameInset, 
                frameInset + scaledTransomHeight + mullionThickness, 
                svgWidth - (frameInset * 2), 
                svgHeight - frameInset - scaledTransomHeight - mullionThickness, 
                'center'
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
            
            {openableCasements === "center" && (
              <>
                {/* Center opening - center split line */}
                <path 
                  d={`M ${svgWidth/2} ${frameInset} 
                      L ${svgWidth/2} ${svgHeight - frameInset}`}
                  stroke="black" 
                  strokeDasharray="5,5" 
                  strokeWidth="1"
                  fill="none"
                />
              </>
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
            
            {/* Casements for each section - Equal division of width for all three sections */}
            {/* Calculate section width with equal divisions */}
            {(() => {
              // Calculate the effective total width for dividing (minus frame insets on both sides)
              const effectiveWidth = svgWidth - (frameInset * 2);
              // Each section gets exactly one third of the effective width
              const sectionWidth = effectiveWidth / 3;
              
              return (
                <>
                  {/* Left casement */}
                  <rect 
                    x={frameInset - 1} 
                    y={frameInset - 1} 
                    width={sectionWidth - (mullionThickness/2) + 1} 
                    height={svgHeight - (frameInset * 2) + 2} 
                    fill="none" 
                    className="window-casement" 
                  />
                  
                  {/* Left casement inner border 50mm wide with light blue fill */}
                  <rect 
                    x={frameInset + innerBorderWidth} 
                    y={frameInset + innerBorderWidth} 
                    width={sectionWidth - (mullionThickness/2) - (innerBorderWidth * 2) + 1} 
                    height={svgHeight - ((frameInset + innerBorderWidth) * 2)} 
                    className="window-casement-interior"
                  />
                  
                  {/* Middle casement */}
                  <rect 
                    x={frameInset + sectionWidth + (mullionThickness/2)} 
                    y={frameInset - 1} 
                    width={sectionWidth - mullionThickness + 2} 
                    height={svgHeight - (frameInset * 2) + 2} 
                    fill="none" 
                    className="window-casement" 
                  />
                  
                  {/* Middle casement inner border 50mm wide with light blue fill */}
                  <rect 
                    x={frameInset + sectionWidth + (mullionThickness/2) + innerBorderWidth} 
                    y={frameInset + innerBorderWidth} 
                    width={sectionWidth - mullionThickness - (innerBorderWidth * 2) + 2} 
                    height={svgHeight - ((frameInset + innerBorderWidth) * 2)} 
                    className="window-casement-interior"
                  />
                  
                  {/* Right casement */}
                  <rect 
                    x={frameInset + (sectionWidth * 2) + (mullionThickness/2)} 
                    y={frameInset - 1} 
                    width={sectionWidth - (mullionThickness/2) + 1} 
                    height={svgHeight - (frameInset * 2) + 2} 
                    fill="none" 
                    className="window-casement" 
                  />
                  
                  {/* Right casement inner border 50mm wide with light blue fill */}
                  <rect 
                    x={frameInset + (sectionWidth * 2) + (mullionThickness/2) + innerBorderWidth} 
                    y={frameInset + innerBorderWidth} 
                    width={sectionWidth - (mullionThickness/2) - (innerBorderWidth * 2) + 1} 
                    height={svgHeight - ((frameInset + innerBorderWidth) * 2)} 
                    className="window-casement-interior"
                  />
                </>
              );
            })()}
            
            {/* Mullions (vertical dividers between sections) */}
            {(() => {
              // Calculate the effective total width for dividing (minus frame insets on both sides)
              const effectiveWidth = svgWidth - (frameInset * 2);
              // Each section gets exactly one third of the effective width
              const sectionWidth = effectiveWidth / 3;
              
              return (
                <>
                  {/* First mullion (between left and middle) */}
                  <rect 
                    x={frameInset + sectionWidth - (mullionThickness / 2)} 
                    y={frameInset} 
                    width={mullionThickness} 
                    height={svgHeight - (frameInset * 2)} 
                    className="window-mullion" 
                  />
                  
                  {/* Second mullion (between middle and right) */}
                  <rect 
                    x={frameInset + (sectionWidth * 2) - (mullionThickness / 2)} 
                    y={frameInset} 
                    width={mullionThickness} 
                    height={svgHeight - (frameInset * 2)} 
                    className="window-mullion" 
                  />
                </>
              );
            })()}
            
            {/* Hinge indicators for left and right sections */}
            {(() => {
              // Calculate the effective total width for dividing (minus frame insets on both sides)
              const effectiveWidth = svgWidth - (frameInset * 2);
              // Each section gets exactly one third of the effective width
              const sectionWidth = effectiveWidth / 3;
              
              return (
                <>
                  {/* Left section opening */}
                  {(openableCasements === "left" || openableCasements === "both") && (
                    renderHingeIndicator(
                      frameInset, 
                      frameInset, 
                      sectionWidth, 
                      svgHeight - (frameInset * 2), 
                      'left'
                    )
                  )}
                  
                  {/* Right section opening */}
                  {(openableCasements === "right" || openableCasements === "both") && (
                    renderHingeIndicator(
                      frameInset + (sectionWidth * 2), 
                      frameInset, 
                      sectionWidth, 
                      svgHeight - (frameInset * 2), 
                      'right'
                    )
                  )}
                  
                  {/* Center casement opening - hinged on the left */}
                  {openableCasements === "center-left" && (
                    renderHingeIndicator(
                      frameInset + sectionWidth, 
                      frameInset, 
                      sectionWidth, 
                      svgHeight - (frameInset * 2), 
                      'left'
                    )
                  )}
                  
                  {/* Center casement opening - hinged on the right */}
                  {openableCasements === "center-right" && (
                    renderHingeIndicator(
                      frameInset + sectionWidth, 
                      frameInset, 
                      sectionWidth, 
                      svgHeight - (frameInset * 2), 
                      'right'
                    )
                  )}
                </>
              );
            })()}
          </>
        );

      case "quad":
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
            
            {/* Casements for each section - Equal division of width for all four sections */}
            {(() => {
              // Calculate the effective total width for dividing (minus frame insets on both sides)
              const effectiveWidth = svgWidth - (frameInset * 2);
              // Each section gets exactly one fourth of the effective width
              const sectionWidth = effectiveWidth / 4;
              
              return (
                <>
                  {/* Section 1 (leftmost) */}
                  <rect 
                    x={frameInset - 1} 
                    y={frameInset - 1} 
                    width={sectionWidth - (mullionThickness/2) + 1} 
                    height={svgHeight - (frameInset * 2) + 2} 
                    fill="none" 
                    className="window-casement" 
                  />
                  
                  {/* Section 1 inner border 50mm wide with light blue fill */}
                  <rect 
                    x={frameInset + innerBorderWidth} 
                    y={frameInset + innerBorderWidth} 
                    width={sectionWidth - (mullionThickness/2) - (innerBorderWidth * 2) + 1} 
                    height={svgHeight - ((frameInset + innerBorderWidth) * 2)} 
                    className="window-casement-interior"
                  />
                  
                  {/* Section 2 */}
                  <rect 
                    x={frameInset + sectionWidth + (mullionThickness/2)} 
                    y={frameInset - 1} 
                    width={sectionWidth - mullionThickness + 2} 
                    height={svgHeight - (frameInset * 2) + 2} 
                    fill="none" 
                    className="window-casement" 
                  />
                  
                  {/* Section 2 inner border 50mm wide with light blue fill */}
                  <rect 
                    x={frameInset + sectionWidth + (mullionThickness/2) + innerBorderWidth} 
                    y={frameInset + innerBorderWidth} 
                    width={sectionWidth - mullionThickness - (innerBorderWidth * 2) + 2} 
                    height={svgHeight - ((frameInset + innerBorderWidth) * 2)} 
                    className="window-casement-interior"
                  />
                  
                  {/* Section 3 */}
                  <rect 
                    x={frameInset + (sectionWidth * 2) + (mullionThickness/2)} 
                    y={frameInset - 1} 
                    width={sectionWidth - mullionThickness + 2} 
                    height={svgHeight - (frameInset * 2) + 2} 
                    fill="none" 
                    className="window-casement" 
                  />
                  
                  {/* Section 3 inner border 50mm wide with light blue fill */}
                  <rect 
                    x={frameInset + (sectionWidth * 2) + (mullionThickness/2) + innerBorderWidth} 
                    y={frameInset + innerBorderWidth} 
                    width={sectionWidth - mullionThickness - (innerBorderWidth * 2) + 2} 
                    height={svgHeight - ((frameInset + innerBorderWidth) * 2)} 
                    className="window-casement-interior"
                  />
                  
                  {/* Section 4 (rightmost) */}
                  <rect 
                    x={frameInset + (sectionWidth * 3) + (mullionThickness/2)} 
                    y={frameInset - 1} 
                    width={sectionWidth - (mullionThickness/2) + 1} 
                    height={svgHeight - (frameInset * 2) + 2} 
                    fill="none" 
                    className="window-casement" 
                  />
                  
                  {/* Section 4 inner border 50mm wide with light blue fill */}
                  <rect 
                    x={frameInset + (sectionWidth * 3) + (mullionThickness/2) + innerBorderWidth} 
                    y={frameInset + innerBorderWidth} 
                    width={sectionWidth - (mullionThickness/2) - (innerBorderWidth * 2) + 1} 
                    height={svgHeight - ((frameInset + innerBorderWidth) * 2)} 
                    className="window-casement-interior"
                  />
                </>
              );
            })()}
            
            {/* Mullions (vertical dividers between sections) */}
            {(() => {
              // Calculate the effective total width for dividing (minus frame insets on both sides)
              const effectiveWidth = svgWidth - (frameInset * 2);
              // Each section gets exactly one fourth of the effective width
              const sectionWidth = effectiveWidth / 4;
              
              return (
                <>
                  {/* First mullion (between section 1 and 2) */}
                  <rect 
                    x={frameInset + sectionWidth - (mullionThickness / 2)} 
                    y={frameInset} 
                    width={mullionThickness} 
                    height={svgHeight - (frameInset * 2)} 
                    className="window-mullion" 
                  />
                  
                  {/* Second mullion (between section 2 and 3) */}
                  <rect 
                    x={frameInset + (sectionWidth * 2) - (mullionThickness / 2)} 
                    y={frameInset} 
                    width={mullionThickness} 
                    height={svgHeight - (frameInset * 2)} 
                    className="window-mullion" 
                  />
                  
                  {/* Third mullion (between section 3 and 4) */}
                  <rect 
                    x={frameInset + (sectionWidth * 3) - (mullionThickness / 2)} 
                    y={frameInset} 
                    width={mullionThickness} 
                    height={svgHeight - (frameInset * 2)} 
                    className="window-mullion" 
                  />
                </>
              );
            })()}
            
            {/* Hinge indicators for casements */}
            {(() => {
              // Calculate the effective total width for dividing (minus frame insets on both sides)
              const effectiveWidth = svgWidth - (frameInset * 2);
              // Each section gets exactly one fourth of the effective width
              const sectionWidth = effectiveWidth / 4;
              
              return (
                <>
                  {/* Leftmost section (1) */}
                  {(openableCasements === "left" || openableCasements === "both" || openableCasements === "outer") && (
                    renderHingeIndicator(
                      frameInset, 
                      frameInset, 
                      sectionWidth - (mullionThickness/2), 
                      svgHeight - (frameInset * 2), 
                      'left'
                    )
                  )}
                  
                  {/* Section 2 */}
                  {(openableCasements === "center-left") && (
                    renderHingeIndicator(
                      frameInset + sectionWidth + (mullionThickness/2), 
                      frameInset, 
                      sectionWidth - mullionThickness, 
                      svgHeight - (frameInset * 2), 
                      'left'
                    )
                  )}
                  
                  {/* Section 3 */}
                  {(openableCasements === "center-right") && (
                    renderHingeIndicator(
                      frameInset + (sectionWidth * 2) + (mullionThickness/2), 
                      frameInset, 
                      sectionWidth - mullionThickness, 
                      svgHeight - (frameInset * 2), 
                      'right'
                    )
                  )}
                  
                  {/* Rightmost section (4) */}
                  {(openableCasements === "right" || openableCasements === "both" || openableCasements === "outer") && (
                    renderHingeIndicator(
                      frameInset + (sectionWidth * 3) + (mullionThickness/2), 
                      frameInset, 
                      sectionWidth - (mullionThickness/2), 
                      svgHeight - (frameInset * 2), 
                      'right'
                    )
                  )}
                </>
              );
            })()}
          </>
        );
        
      case "quad-transom":
        // Calculate the scaled transom height, default to 400mm if not specified
        const quadScaledTransomHeight = (transomHeight ?? 400) * scaleFactor;
        
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
            
            {/* Horizontal transom bar - position based on transom height parameter */}
            <rect 
              x={frameInset} 
              y={frameInset + quadScaledTransomHeight} 
              width={svgWidth - (frameInset * 2)} 
              height={mullionThickness} 
              className="window-mullion" 
            />
            
            {/* Casements and mullions for each section */}
            {(() => {
              // Calculate the effective total width for dividing (minus frame insets on both sides)
              const effectiveWidth = svgWidth - (frameInset * 2);
              // Each section gets exactly one fourth of the effective width
              const sectionWidth = effectiveWidth / 4;
              
              return (
                <>
                  {/* Vertical mullions */}
                  {/* First mullion (between section 1 and 2) */}
                  <rect 
                    x={frameInset + sectionWidth - (mullionThickness / 2)} 
                    y={frameInset} 
                    width={mullionThickness} 
                    height={svgHeight - (frameInset * 2)} 
                    className="window-mullion" 
                  />
                  
                  {/* Second mullion (between section 2 and 3) */}
                  <rect 
                    x={frameInset + (sectionWidth * 2) - (mullionThickness / 2)} 
                    y={frameInset} 
                    width={mullionThickness} 
                    height={svgHeight - (frameInset * 2)} 
                    className="window-mullion" 
                  />
                  
                  {/* Third mullion (between section 3 and 4) */}
                  <rect 
                    x={frameInset + (sectionWidth * 3) - (mullionThickness / 2)} 
                    y={frameInset} 
                    width={mullionThickness} 
                    height={svgHeight - (frameInset * 2)} 
                    className="window-mullion" 
                  />
                  
                  {/* Top row casements - 4 sections */}
                  {/* Top left casement */}
                  <rect 
                    x={frameInset - 1} 
                    y={frameInset - 1} 
                    width={sectionWidth - (mullionThickness/2) + 1} 
                    height={quadScaledTransomHeight + 1} 
                    fill="none" 
                    className="window-casement" 
                  />
                  
                  {/* Top left casement inner border */}
                  <rect 
                    x={frameInset + innerBorderWidth} 
                    y={frameInset + innerBorderWidth} 
                    width={sectionWidth - (mullionThickness/2) - (innerBorderWidth * 2) + 1} 
                    height={quadScaledTransomHeight - (innerBorderWidth * 2)} 
                    className="window-casement-interior"
                  />
                  
                  {/* Top second casement */}
                  <rect 
                    x={frameInset + sectionWidth + (mullionThickness/2) - 1} 
                    y={frameInset - 1} 
                    width={sectionWidth - mullionThickness + 2} 
                    height={quadScaledTransomHeight + 1} 
                    fill="none" 
                    className="window-casement" 
                  />
                  
                  {/* Top second casement inner border */}
                  <rect 
                    x={frameInset + sectionWidth + (mullionThickness/2) + innerBorderWidth} 
                    y={frameInset + innerBorderWidth} 
                    width={sectionWidth - mullionThickness - (innerBorderWidth * 2) + 2} 
                    height={quadScaledTransomHeight - (innerBorderWidth * 2)} 
                    className="window-casement-interior"
                  />
                  
                  {/* Top third casement */}
                  <rect 
                    x={frameInset + (sectionWidth * 2) + (mullionThickness/2) - 1} 
                    y={frameInset - 1} 
                    width={sectionWidth - mullionThickness + 2} 
                    height={quadScaledTransomHeight + 1} 
                    fill="none" 
                    className="window-casement" 
                  />
                  
                  {/* Top third casement inner border */}
                  <rect 
                    x={frameInset + (sectionWidth * 2) + (mullionThickness/2) + innerBorderWidth} 
                    y={frameInset + innerBorderWidth} 
                    width={sectionWidth - mullionThickness - (innerBorderWidth * 2) + 2} 
                    height={quadScaledTransomHeight - (innerBorderWidth * 2)} 
                    className="window-casement-interior"
                  />
                  
                  {/* Top right casement */}
                  <rect 
                    x={frameInset + (sectionWidth * 3) + (mullionThickness/2) - 1} 
                    y={frameInset - 1} 
                    width={sectionWidth - (mullionThickness/2) + 1} 
                    height={quadScaledTransomHeight + 1} 
                    fill="none" 
                    className="window-casement" 
                  />
                  
                  {/* Top right casement inner border */}
                  <rect 
                    x={frameInset + (sectionWidth * 3) + (mullionThickness/2) + innerBorderWidth} 
                    y={frameInset + innerBorderWidth} 
                    width={sectionWidth - (mullionThickness/2) - (innerBorderWidth * 2) + 1} 
                    height={quadScaledTransomHeight - (innerBorderWidth * 2)} 
                    className="window-casement-interior"
                  />
                  
                  {/* Bottom row casements - 4 sections */}
                  {/* Bottom left casement */}
                  <rect 
                    x={frameInset - 1} 
                    y={frameInset + quadScaledTransomHeight + mullionThickness - 1} 
                    width={sectionWidth - (mullionThickness/2) + 1} 
                    height={svgHeight - frameInset - quadScaledTransomHeight - mullionThickness + 1} 
                    fill="none" 
                    className="window-casement" 
                  />
                  
                  {/* Bottom left casement inner border */}
                  <rect 
                    x={frameInset + innerBorderWidth} 
                    y={frameInset + quadScaledTransomHeight + mullionThickness + innerBorderWidth} 
                    width={sectionWidth - (mullionThickness/2) - (innerBorderWidth * 2) + 1} 
                    height={svgHeight - frameInset - quadScaledTransomHeight - mullionThickness - innerBorderWidth * 2 + 1} 
                    className="window-casement-interior"
                  />
                  
                  {/* Bottom second casement */}
                  <rect 
                    x={frameInset + sectionWidth + (mullionThickness/2) - 1} 
                    y={frameInset + quadScaledTransomHeight + mullionThickness - 1} 
                    width={sectionWidth - mullionThickness + 2} 
                    height={svgHeight - frameInset - quadScaledTransomHeight - mullionThickness + 1} 
                    fill="none" 
                    className="window-casement" 
                  />
                  
                  {/* Bottom second casement inner border */}
                  <rect 
                    x={frameInset + sectionWidth + (mullionThickness/2) + innerBorderWidth} 
                    y={frameInset + quadScaledTransomHeight + mullionThickness + innerBorderWidth} 
                    width={sectionWidth - mullionThickness - (innerBorderWidth * 2) + 2} 
                    height={svgHeight - frameInset - quadScaledTransomHeight - mullionThickness - innerBorderWidth * 2 + 1} 
                    className="window-casement-interior"
                  />
                  
                  {/* Bottom third casement */}
                  <rect 
                    x={frameInset + (sectionWidth * 2) + (mullionThickness/2) - 1} 
                    y={frameInset + quadScaledTransomHeight + mullionThickness - 1} 
                    width={sectionWidth - mullionThickness + 2} 
                    height={svgHeight - frameInset - quadScaledTransomHeight - mullionThickness + 1} 
                    fill="none" 
                    className="window-casement" 
                  />
                  
                  {/* Bottom third casement inner border */}
                  <rect 
                    x={frameInset + (sectionWidth * 2) + (mullionThickness/2) + innerBorderWidth} 
                    y={frameInset + quadScaledTransomHeight + mullionThickness + innerBorderWidth} 
                    width={sectionWidth - mullionThickness - (innerBorderWidth * 2) + 2} 
                    height={svgHeight - frameInset - quadScaledTransomHeight - mullionThickness - innerBorderWidth * 2 + 1} 
                    className="window-casement-interior"
                  />
                  
                  {/* Bottom right casement */}
                  <rect 
                    x={frameInset + (sectionWidth * 3) + (mullionThickness/2) - 1} 
                    y={frameInset + quadScaledTransomHeight + mullionThickness - 1} 
                    width={sectionWidth - (mullionThickness/2) + 1} 
                    height={svgHeight - frameInset - quadScaledTransomHeight - mullionThickness + 1} 
                    fill="none" 
                    className="window-casement" 
                  />
                  
                  {/* Bottom right casement inner border */}
                  <rect 
                    x={frameInset + (sectionWidth * 3) + (mullionThickness/2) + innerBorderWidth} 
                    y={frameInset + quadScaledTransomHeight + mullionThickness + innerBorderWidth} 
                    width={sectionWidth - (mullionThickness/2) - (innerBorderWidth * 2) + 1} 
                    height={svgHeight - frameInset - quadScaledTransomHeight - mullionThickness - innerBorderWidth * 2 + 1} 
                    className="window-casement-interior"
                  />
                </>
              );
            })()}
            
            {/* Georgian bars if enabled */}
            {renderGeorgianBars(
              frameInset,
              frameInset,
              svgWidth - (frameInset * 2),
              svgHeight - (frameInset * 2)
            )}
            
            {/* Hinge indicators for the bottom casements */}
            {(() => {
              // Calculate the effective total width for dividing (minus frame insets on both sides)
              const effectiveWidth = svgWidth - (frameInset * 2);
              // Each section gets exactly one fourth of the effective width
              const sectionWidth = effectiveWidth / 4;
              
              return (
                <>
                  {/* Bottom left section */}
                  {(openableCasements === "left" || openableCasements === "both" || openableCasements === "outer") && (
                    renderHingeIndicator(
                      frameInset, 
                      frameInset + quadScaledTransomHeight + mullionThickness,
                      sectionWidth - (mullionThickness/2), 
                      svgHeight - frameInset - quadScaledTransomHeight - mullionThickness, 
                      'left'
                    )
                  )}
                  
                  {/* Bottom inner left section */}
                  {(openableCasements === "center-left") && (
                    renderHingeIndicator(
                      frameInset + sectionWidth + (mullionThickness/2), 
                      frameInset + quadScaledTransomHeight + mullionThickness,
                      sectionWidth - mullionThickness, 
                      svgHeight - frameInset - quadScaledTransomHeight - mullionThickness, 
                      'left'
                    )
                  )}
                  
                  {/* Bottom inner right section */}
                  {(openableCasements === "center-right") && (
                    renderHingeIndicator(
                      frameInset + (sectionWidth * 2) + (mullionThickness/2), 
                      frameInset + quadScaledTransomHeight + mullionThickness,
                      sectionWidth - mullionThickness, 
                      svgHeight - frameInset - quadScaledTransomHeight - mullionThickness, 
                      'right'
                    )
                  )}
                  
                  {/* Bottom right section */}
                  {(openableCasements === "right" || openableCasements === "both" || openableCasements === "outer") && (
                    renderHingeIndicator(
                      frameInset + (sectionWidth * 3) + (mullionThickness/2), 
                      frameInset + quadScaledTransomHeight + mullionThickness,
                      sectionWidth - (mullionThickness/2), 
                      svgHeight - frameInset - quadScaledTransomHeight - mullionThickness, 
                      'right'
                    )
                  )}
                </>
              );
            })()}
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
            {(() => {
              // Calculate the effective total width for dividing (minus frame insets on both sides)
              const effectiveWidth = svgWidth - (frameInset * 2);
              // Each section gets exactly one third of the effective width
              const sectionWidth = effectiveWidth / 3;
              
              return (
                <>
                  {/* First mullion (between left and middle) */}
                  <rect 
                    x={frameInset + sectionWidth - (mullionThickness / 2)} 
                    y={frameInset} 
                    width={mullionThickness} 
                    height={svgHeight - (frameInset * 2)} 
                    className="window-mullion" 
                  />
                  
                  {/* Second mullion (between middle and right) */}
                  <rect 
                    x={frameInset + (sectionWidth * 2) - (mullionThickness / 2)} 
                    y={frameInset} 
                    width={mullionThickness} 
                    height={svgHeight - (frameInset * 2)} 
                    className="window-mullion" 
                  />
                </>
              );
            })()}
            
            {/* Horizontal transom bar - fixed at top 1/3 of the window */}
            <rect 
              x={frameInset} 
              y={frameInset + (svgHeight / 3)} 
              width={svgWidth - (frameInset * 2)} 
              height={mullionThickness} 
              className="window-mullion" 
            />
            
            {/* Upper casements, all with equal width */}
            {(() => {
              // Calculate the effective total width for dividing (minus frame insets on both sides)
              const effectiveWidth = svgWidth - (frameInset * 2);
              // Each section gets exactly one third of the effective width
              const sectionWidth = effectiveWidth / 3;
              
              return (
                <>
                  {/* Upper left fixed casement */}
                  <rect 
                    x={frameInset - 1} 
                    y={frameInset - 1} 
                    width={sectionWidth - (mullionThickness/2) + 1} 
                    height={(svgHeight / 3) + 1} 
                    fill="none" 
                    className="window-casement" 
                  />
                  
                  {/* Upper left casement inner border with light blue fill */}
                  <rect 
                    x={frameInset + innerBorderWidth} 
                    y={frameInset + innerBorderWidth} 
                    width={sectionWidth - (mullionThickness/2) - (innerBorderWidth * 2) + 1} 
                    height={(svgHeight / 3) - (innerBorderWidth * 2)} 
                    className="window-casement-interior"
                  />
                  
                  {/* Upper middle fixed casement */}
                  <rect 
                    x={frameInset + sectionWidth + (mullionThickness/2)} 
                    y={frameInset - 1} 
                    width={sectionWidth - mullionThickness} 
                    height={(svgHeight / 3) + 1} 
                    fill="none" 
                    className="window-casement" 
                  />
                  
                  {/* Upper middle casement inner border with light blue fill */}
                  <rect 
                    x={frameInset + sectionWidth + (mullionThickness/2) + innerBorderWidth} 
                    y={frameInset + innerBorderWidth} 
                    width={sectionWidth - mullionThickness - (innerBorderWidth * 2)} 
                    height={(svgHeight / 3) - (innerBorderWidth * 2)} 
                    className="window-casement-interior"
                  />
                  
                  {/* Upper right fixed casement */}
                  <rect 
                    x={frameInset + (sectionWidth * 2) + (mullionThickness/2)} 
                    y={frameInset - 1} 
                    width={sectionWidth - (mullionThickness/2) + 1} 
                    height={(svgHeight / 3) + 1} 
                    fill="none" 
                    className="window-casement" 
                  />
                  
                  {/* Upper right casement inner border with light blue fill */}
                  <rect 
                    x={frameInset + (sectionWidth * 2) + (mullionThickness/2) + innerBorderWidth} 
                    y={frameInset + innerBorderWidth} 
                    width={sectionWidth - (mullionThickness/2) - (innerBorderWidth * 2) + 1} 
                    height={(svgHeight / 3) - (innerBorderWidth * 2)} 
                    className="window-casement-interior"
                  />
                </>
              );
            })()}
            
            {/* Lower casements with equal widths */}
            {(() => {
              // Calculate the effective total width for dividing (minus frame insets on both sides)
              const effectiveWidth = svgWidth - (frameInset * 2);
              // Each section gets exactly one third of the effective width
              const sectionWidth = effectiveWidth / 3;
              const lowerHeight = (svgHeight * 2/3) - frameInset - mullionThickness + 1;
              
              return (
                <>
                  {/* Lower left opening casement */}
                  <rect 
                    x={frameInset - 1} 
                    y={frameInset + (svgHeight / 3) + mullionThickness - 1} 
                    width={sectionWidth - (mullionThickness/2) + 1} 
                    height={lowerHeight} 
                    fill="none" 
                    className="window-casement" 
                  />
                  
                  {/* Lower left casement inner border with light blue fill */}
                  <rect 
                    x={frameInset + innerBorderWidth} 
                    y={frameInset + (svgHeight / 3) + mullionThickness + innerBorderWidth} 
                    width={sectionWidth - (mullionThickness/2) - (innerBorderWidth * 2) + 1} 
                    height={lowerHeight - (innerBorderWidth * 2)} 
                    className="window-casement-interior"
                  />
                  
                  {/* Lower middle casement */}
                  <rect 
                    x={frameInset + sectionWidth + (mullionThickness/2)} 
                    y={frameInset + (svgHeight / 3) + mullionThickness - 1} 
                    width={sectionWidth - mullionThickness} 
                    height={lowerHeight} 
                    fill="none" 
                    className="window-casement" 
                  />
                  
                  {/* Lower middle casement inner border with light blue fill */}
                  <rect 
                    x={frameInset + sectionWidth + (mullionThickness/2) + innerBorderWidth} 
                    y={frameInset + (svgHeight / 3) + mullionThickness + innerBorderWidth} 
                    width={sectionWidth - mullionThickness - (innerBorderWidth * 2)} 
                    height={lowerHeight - (innerBorderWidth * 2)} 
                    className="window-casement-interior"
                  />
                  
                  {/* Lower right opening casement */}
                  <rect 
                    x={frameInset + (sectionWidth * 2) + (mullionThickness/2)} 
                    y={frameInset + (svgHeight / 3) + mullionThickness - 1} 
                    width={sectionWidth - (mullionThickness/2) + 1} 
                    height={lowerHeight} 
                    fill="none" 
                    className="window-casement" 
                  />
                  
                  {/* Lower right casement inner border with light blue fill */}
                  <rect 
                    x={frameInset + (sectionWidth * 2) + (mullionThickness/2) + innerBorderWidth} 
                    y={frameInset + (svgHeight / 3) + mullionThickness + innerBorderWidth} 
                    width={sectionWidth - (mullionThickness/2) - (innerBorderWidth * 2) + 1} 
                    height={lowerHeight - (innerBorderWidth * 2)} 
                    className="window-casement-interior"
                  />
                </>
              );
            })()}
            
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
            
            {/* Center casement opening - hinged on the left */}
            {openableCasements === "center-left" && (
              renderHingeIndicator(
                (svgWidth / 3) + (mullionThickness / 2), 
                frameInset + (svgHeight / 3) + mullionThickness, 
                (svgWidth / 3) - mullionThickness, 
                (svgHeight * 2/3) - frameInset - mullionThickness, 
                'left'
              )
            )}
            
            {/* Center casement opening - hinged on the right */}
            {openableCasements === "center-right" && (
              renderHingeIndicator(
                (svgWidth / 3) + (mullionThickness / 2), 
                frameInset + (svgHeight / 3) + mullionThickness, 
                (svgWidth / 3) - mullionThickness, 
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
    <div className={`window-drawing ${windowClassName}`}>
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