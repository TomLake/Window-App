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

  // Find the window type configuration
  const windowConfig = useMemo(() => windowTypes.find(w => w.id === type) || windowTypes[0], [type]);

  // Constants for rendering - all values in mm
  const FRAME_THICKNESS = 45; // Frame thickness
  const MULLION_THICKNESS = 30; // Mullion/divider thickness
  const INNER_BORDER_THICKNESS = 50; // Inner glass border thickness
  const SCALE_FACTOR = 0.25; // Scale factor for SVG rendering
  const MAX_SVG_WIDTH = 1000; // Max SVG width for display
  
  // Calculate scale based on window dimensions
  const scale = Math.min(
    (MAX_SVG_WIDTH - 40) / width, // Horizontal constraint with some padding
    MAX_SVG_WIDTH / height // Vertical constraint
  ) * SCALE_FACTOR;
  
  // Calculate SVG dimensions
  const svgWidth = width * scale;
  const svgHeight = height * scale;
  
  // Calculate dimensions for inner elements
  const innerWidth = svgWidth - (FRAME_THICKNESS * 2 * scale);
  const innerHeight = svgHeight - (FRAME_THICKNESS * 2 * scale);
  
  // Calculate border width for inner elements
  const innerBorderWidth = INNER_BORDER_THICKNESS * scale;
  const mullionWidth = MULLION_THICKNESS * scale;
  
  // Format dimensions for display
  const formatDimension = (value: number) => `${value} mm`;
  
  // Render Georgian bars if enabled
  const renderGeorgianBars = (x: number, y: number, width: number, height: number) => {
    if (!hasGeorgianBars) return null;
    
    const barWidth = 5 * scale; // 5mm bar width after scaling
    const bars = [];
    
    // Calculate horizontal bar spacing
    const horizontalSpacing = height / (georgianBarsHorizontal + 1);
    for (let i = 1; i <= georgianBarsHorizontal; i++) {
      const barY = y + (horizontalSpacing * i) - (barWidth / 2);
      bars.push(
        <rect 
          key={`h-bar-${i}`} 
          x={x} 
          y={barY} 
          width={width} 
          height={barWidth} 
          fill="#000" 
        />
      );
    }
    
    // Calculate vertical bar spacing
    const verticalSpacing = width / (georgianBarsVertical + 1);
    for (let i = 1; i <= georgianBarsVertical; i++) {
      const barX = x + (verticalSpacing * i) - (barWidth / 2);
      bars.push(
        <rect 
          key={`v-bar-${i}`} 
          x={barX} 
          y={y} 
          width={barWidth} 
          height={height} 
          fill="#000" 
        />
      );
    }
    
    return bars;
  };
  
  // Render opening indicator lines
  const renderOpeningIndicator = (x: number, y: number, width: number, height: number, position: string, isTop = false) => {
    if (position === "none") return null;
    
    // Adjust the positions based on whether this is a top or bottom section
    const positionAdjusted = isTop ? 
      (topCasementsOpenable === "none" ? "none" : position) : 
      (openableCasements === "none" ? "none" : position);
    
    if (positionAdjusted === "none") return null;
    
    // Determine the hinge and opening positions
    const isLeft = positionAdjusted === "left" || positionAdjusted === "both" || positionAdjusted === "center-left";
    const isRight = positionAdjusted === "right" || positionAdjusted === "both" || positionAdjusted === "center-right";
    const isCenter = positionAdjusted === "center-left" || positionAdjusted === "center-right";
    
    return (
      <>
        {/* Left side opening */}
        {isLeft && !isCenter && (
          <polyline 
            points={`
              ${x + 15 * scale},${y + 15 * scale} 
              ${x + width / 2},${y + height / 2} 
              ${x + 15 * scale},${y + height - 15 * scale}
            `} 
            stroke="#000" 
            strokeWidth={1} 
            strokeDasharray="5,5" 
            fill="none" 
          />
        )}
        
        {/* Right side opening */}
        {isRight && !isCenter && (
          <polyline 
            points={`
              ${x + width - 15 * scale},${y + 15 * scale} 
              ${x + width / 2},${y + height / 2} 
              ${x + width - 15 * scale},${y + height - 15 * scale}
            `} 
            stroke="#000" 
            strokeWidth={1} 
            strokeDasharray="5,5" 
            fill="none" 
          />
        )}
        
        {/* Center-left opening */}
        {positionAdjusted === "center-left" && (
          <polyline 
            points={`
              ${x + width / 2 - 30 * scale},${y + 15 * scale} 
              ${x + width / 2 - 15 * scale},${y + height / 2} 
              ${x + width / 2 - 30 * scale},${y + height - 15 * scale}
            `} 
            stroke="#000" 
            strokeWidth={1} 
            strokeDasharray="5,5" 
            fill="none" 
          />
        )}
        
        {/* Center-right opening */}
        {positionAdjusted === "center-right" && (
          <polyline 
            points={`
              ${x + width / 2 + 30 * scale},${y + 15 * scale} 
              ${x + width / 2 + 15 * scale},${y + height / 2} 
              ${x + width / 2 + 30 * scale},${y + height - 15 * scale}
            `} 
            stroke="#000" 
            strokeWidth={1} 
            strokeDasharray="5,5" 
            fill="none" 
          />
        )}
      </>
    );
  };
  

  
  // Render the appropriate window based on type
  const renderWindow = () => {
    // Calculate scaled transom height once before using it
    const scaledTransomHeight = transomHeight * scale;
    
    switch (windowConfig.id) {
      case "quad":
      case "quad-transom": {
        // Check if it's the transom version
        const hasQuadTransom = windowConfig.id === "quad-transom";
        const quadTransomHeight = hasQuadTransom ? scaledTransomHeight : 0;
        
        return (
          <>
            {/* Frame */}
            <rect x="0" y="0" width={svgWidth} height={svgHeight} className="window-frame" />
            
            {/* Glass */}
            <rect 
              x={FRAME_THICKNESS * scale} 
              y={FRAME_THICKNESS * scale} 
              width={innerWidth} 
              height={innerHeight} 
              className="window-glass"
              fill={glassType === "Obscure" ? "url(#pattern-obscure)" : "none"} 
            />
            
            {/* Mullions */}
            {/* Horizontal mullion */}
            <rect 
              x={FRAME_THICKNESS * scale} 
              y={(svgHeight / 2) - (mullionWidth / 2)} 
              width={innerWidth} 
              height={mullionWidth} 
              className="window-mullion" 
            />
            
            {/* Vertical mullion */}
            <rect 
              x={(svgWidth / 2) - (mullionWidth / 2)} 
              y={FRAME_THICKNESS * scale} 
              width={mullionWidth} 
              height={innerHeight} 
              className="window-mullion" 
            />
            
            {/* Transom bar if needed */}
            {hasQuadTransom && (
              <rect 
                x={FRAME_THICKNESS * scale} 
                y={FRAME_THICKNESS * scale + quadTransomHeight}
                width={innerWidth} 
                height={mullionWidth} 
                className="window-mullion" 
              />
            )}
            
            {/* Internal borders - top left */}
            <rect 
              x={FRAME_THICKNESS * scale} 
              y={FRAME_THICKNESS * scale} 
              width={innerBorderWidth} 
              height={hasQuadTransom ? quadTransomHeight : innerHeight / 2} 
              className="inner-border" 
            />
            <rect 
              x={FRAME_THICKNESS * scale} 
              y={FRAME_THICKNESS * scale} 
              width={(innerWidth / 2) - (mullionWidth / 2)} 
              height={innerBorderWidth} 
              className="inner-border" 
            />
            
            {/* Internal borders - top right */}
            <rect 
              x={(svgWidth / 2) + (mullionWidth / 2)} 
              y={FRAME_THICKNESS * scale} 
              width={innerBorderWidth} 
              height={hasQuadTransom ? quadTransomHeight : innerHeight / 2} 
              className="inner-border" 
            />
            <rect 
              x={(svgWidth / 2) + (mullionWidth / 2)} 
              y={FRAME_THICKNESS * scale} 
              width={(innerWidth / 2) - (mullionWidth / 2)} 
              height={innerBorderWidth} 
              className="inner-border" 
            />
            
            {/* Internal borders - bottom left */}
            <rect 
              x={FRAME_THICKNESS * scale} 
              y={hasQuadTransom 
                ? FRAME_THICKNESS * scale + quadTransomHeight + mullionWidth 
                : (svgHeight / 2) + (mullionWidth / 2)} 
              width={innerBorderWidth} 
              height={hasQuadTransom 
                ? innerHeight - quadTransomHeight - mullionWidth 
                : innerHeight / 2} 
              className="inner-border" 
            />
            <rect 
              x={FRAME_THICKNESS * scale} 
              y={svgHeight - FRAME_THICKNESS * scale - innerBorderWidth} 
              width={(innerWidth / 2) - (mullionWidth / 2)} 
              height={innerBorderWidth} 
              className="inner-border" 
            />
            
            {/* Internal borders - bottom right */}
            <rect 
              x={(svgWidth / 2) + (mullionWidth / 2)} 
              y={hasQuadTransom 
                ? FRAME_THICKNESS * scale + quadTransomHeight + mullionWidth 
                : (svgHeight / 2) + (mullionWidth / 2)} 
              width={innerBorderWidth} 
              height={hasQuadTransom 
                ? innerHeight - quadTransomHeight - mullionWidth 
                : innerHeight / 2} 
              className="inner-border" 
            />
            <rect 
              x={(svgWidth / 2) + (mullionWidth / 2)} 
              y={svgHeight - FRAME_THICKNESS * scale - innerBorderWidth} 
              width={(innerWidth / 2) - (mullionWidth / 2)} 
              height={innerBorderWidth} 
              className="inner-border" 
            />
            
            {/* Render opening indicators */}
            {/* Top left */}
            {renderOpeningIndicator(
              FRAME_THICKNESS * scale + innerBorderWidth, 
              FRAME_THICKNESS * scale + innerBorderWidth, 
              (innerWidth / 2) - innerBorderWidth - mullionWidth / 2, 
              (hasQuadTransom ? quadTransomHeight : innerHeight / 2) - innerBorderWidth * 2, 
              hasQuadTransom ? topCasementsOpenable : openableCasements,
              hasQuadTransom
            )}
            
            {/* Top right */}
            {renderOpeningIndicator(
              (svgWidth / 2) + (mullionWidth / 2) + innerBorderWidth, 
              FRAME_THICKNESS * scale + innerBorderWidth, 
              (innerWidth / 2) - innerBorderWidth - mullionWidth / 2, 
              (hasQuadTransom ? quadTransomHeight : innerHeight / 2) - innerBorderWidth * 2, 
              hasQuadTransom ? topCasementsOpenable : openableCasements,
              hasQuadTransom
            )}
            
            {/* Bottom left */}
            {renderOpeningIndicator(
              FRAME_THICKNESS * scale + innerBorderWidth, 
              (hasQuadTransom 
                ? FRAME_THICKNESS * scale + quadTransomHeight + mullionWidth + innerBorderWidth 
                : (svgHeight / 2) + (mullionWidth / 2) + innerBorderWidth), 
              (innerWidth / 2) - innerBorderWidth - mullionWidth / 2, 
              (hasQuadTransom 
                ? innerHeight - quadTransomHeight - mullionWidth - innerBorderWidth * 2 
                : (innerHeight / 2) - innerBorderWidth * 2), 
              openableCasements
            )}
            
            {/* Bottom right */}
            {renderOpeningIndicator(
              (svgWidth / 2) + (mullionWidth / 2) + innerBorderWidth, 
              (hasQuadTransom 
                ? FRAME_THICKNESS * scale + quadTransomHeight + mullionWidth + innerBorderWidth 
                : (svgHeight / 2) + (mullionWidth / 2) + innerBorderWidth), 
              (innerWidth / 2) - innerBorderWidth - mullionWidth / 2, 
              (hasQuadTransom 
                ? innerHeight - quadTransomHeight - mullionWidth - innerBorderWidth * 2 
                : (innerHeight / 2) - innerBorderWidth * 2), 
              openableCasements
            )}
            
            {/* Georgian bars for each section */}
            {hasGeorgianBars && (
              <>
                {/* Top left Georgian bars */}
                {renderGeorgianBars(
                  FRAME_THICKNESS * scale + innerBorderWidth, 
                  FRAME_THICKNESS * scale + innerBorderWidth, 
                  (innerWidth / 2) - innerBorderWidth - mullionWidth / 2, 
                  (hasQuadTransom ? quadTransomHeight : innerHeight / 2) - innerBorderWidth * 2
                )}
                
                {/* Top right Georgian bars */}
                {renderGeorgianBars(
                  (svgWidth / 2) + (mullionWidth / 2) + innerBorderWidth, 
                  FRAME_THICKNESS * scale + innerBorderWidth, 
                  (innerWidth / 2) - innerBorderWidth - mullionWidth / 2, 
                  (hasQuadTransom ? quadTransomHeight : innerHeight / 2) - innerBorderWidth * 2
                )}
                
                {/* Bottom left Georgian bars */}
                {renderGeorgianBars(
                  FRAME_THICKNESS * scale + innerBorderWidth, 
                  (hasQuadTransom 
                    ? FRAME_THICKNESS * scale + quadTransomHeight + mullionWidth + innerBorderWidth 
                    : (svgHeight / 2) + (mullionWidth / 2) + innerBorderWidth), 
                  (innerWidth / 2) - innerBorderWidth - mullionWidth / 2, 
                  (hasQuadTransom 
                    ? innerHeight - quadTransomHeight - mullionWidth - innerBorderWidth * 2 
                    : (innerHeight / 2) - innerBorderWidth * 2)
                )}
                
                {/* Bottom right Georgian bars */}
                {renderGeorgianBars(
                  (svgWidth / 2) + (mullionWidth / 2) + innerBorderWidth, 
                  (hasQuadTransom 
                    ? FRAME_THICKNESS * scale + quadTransomHeight + mullionWidth + innerBorderWidth 
                    : (svgHeight / 2) + (mullionWidth / 2) + innerBorderWidth), 
                  (innerWidth / 2) - innerBorderWidth - mullionWidth / 2, 
                  (hasQuadTransom 
                    ? innerHeight - quadTransomHeight - mullionWidth - innerBorderWidth * 2 
                    : (innerHeight / 2) - innerBorderWidth * 2)
                )}
              </>
            )}
          </>
        );
      }
    
      case "triple":
      case "triple-transom": {
        const hasTripleTransom = windowConfig.id === "triple-transom";
        const tripleTransomHeight = hasTripleTransom ? scaledTransomHeight : 0;
        
        // Calculate section width (accounting for mullions)
        const sectionWidth = (innerWidth - (mullionWidth * 2)) / 3;
        
        return (
          <>
            {/* Frame */}
            <rect x="0" y="0" width={svgWidth} height={svgHeight} className="window-frame" />
            
            {/* Glass */}
            <rect 
              x={FRAME_THICKNESS * scale} 
              y={FRAME_THICKNESS * scale} 
              width={innerWidth} 
              height={innerHeight} 
              className="window-glass"
              fill={glassType === "Obscure" ? "url(#pattern-obscure)" : "none"}  
            />
            
            {/* Mullions */}
            {/* First vertical mullion */}
            <rect 
              x={FRAME_THICKNESS * scale + sectionWidth} 
              y={FRAME_THICKNESS * scale} 
              width={mullionWidth} 
              height={innerHeight} 
              className="window-mullion" 
            />
            
            {/* Second vertical mullion */}
            <rect 
              x={FRAME_THICKNESS * scale + sectionWidth * 2 + mullionWidth} 
              y={FRAME_THICKNESS * scale} 
              width={mullionWidth} 
              height={innerHeight} 
              className="window-mullion" 
            />
            
            {/* Transom bar if needed */}
            {hasTripleTransom && (
              <rect 
                x={FRAME_THICKNESS * scale} 
                y={FRAME_THICKNESS * scale + tripleTransomHeight}
                width={innerWidth} 
                height={mullionWidth} 
                className="window-mullion" 
              />
            )}
            
            {/* Internal borders - left section */}
            <rect 
              x={FRAME_THICKNESS * scale} 
              y={FRAME_THICKNESS * scale} 
              width={innerBorderWidth} 
              height={hasTripleTransom ? tripleTransomHeight : innerHeight} 
              className="inner-border" 
            />
            <rect 
              x={FRAME_THICKNESS * scale} 
              y={FRAME_THICKNESS * scale} 
              width={sectionWidth} 
              height={innerBorderWidth} 
              className="inner-border" 
            />
            
            {/* Internal borders - middle section */}
            <rect 
              x={FRAME_THICKNESS * scale + sectionWidth + mullionWidth} 
              y={FRAME_THICKNESS * scale} 
              width={sectionWidth} 
              height={innerBorderWidth} 
              className="inner-border" 
            />
            
            {/* Internal borders - right section */}
            <rect 
              x={FRAME_THICKNESS * scale + sectionWidth * 2 + mullionWidth * 2} 
              y={FRAME_THICKNESS * scale} 
              width={innerBorderWidth} 
              height={hasTripleTransom ? tripleTransomHeight : innerHeight} 
              className="inner-border" 
            />
            <rect 
              x={FRAME_THICKNESS * scale + sectionWidth * 2 + mullionWidth * 2} 
              y={FRAME_THICKNESS * scale} 
              width={sectionWidth} 
              height={innerBorderWidth} 
              className="inner-border" 
            />
            
            {/* Bottom borders */}
            <rect 
              x={FRAME_THICKNESS * scale} 
              y={svgHeight - FRAME_THICKNESS * scale - innerBorderWidth} 
              width={sectionWidth} 
              height={innerBorderWidth} 
              className="inner-border" 
            />
            <rect 
              x={FRAME_THICKNESS * scale + sectionWidth + mullionWidth} 
              y={svgHeight - FRAME_THICKNESS * scale - innerBorderWidth} 
              width={sectionWidth} 
              height={innerBorderWidth} 
              className="inner-border" 
            />
            <rect 
              x={FRAME_THICKNESS * scale + sectionWidth * 2 + mullionWidth * 2} 
              y={svgHeight - FRAME_THICKNESS * scale - innerBorderWidth} 
              width={sectionWidth} 
              height={innerBorderWidth} 
              className="inner-border" 
            />
            
            {/* Add bottom internal borders for transom window */}
            {hasTripleTransom && (
              <>
                <rect 
                  x={FRAME_THICKNESS * scale} 
                  y={FRAME_THICKNESS * scale + tripleTransomHeight + mullionWidth} 
                  width={innerBorderWidth} 
                  height={innerHeight - tripleTransomHeight - mullionWidth} 
                  className="inner-border" 
                />
                <rect 
                  x={FRAME_THICKNESS * scale + sectionWidth * 2 + mullionWidth * 2} 
                  y={FRAME_THICKNESS * scale + tripleTransomHeight + mullionWidth} 
                  width={innerBorderWidth} 
                  height={innerHeight - tripleTransomHeight - mullionWidth} 
                  className="inner-border" 
                />
              </>
            )}
            
            {/* Render opening indicators */}
            {/* Left section */}
            {renderOpeningIndicator(
              FRAME_THICKNESS * scale + innerBorderWidth, 
              FRAME_THICKNESS * scale + innerBorderWidth, 
              sectionWidth - innerBorderWidth, 
              (hasTripleTransom ? tripleTransomHeight : innerHeight) - innerBorderWidth * 2, 
              hasTripleTransom ? topCasementsOpenable : openableCasements,
              hasTripleTransom
            )}
            
            {/* Middle section - special case for center opening */}
            {renderOpeningIndicator(
              FRAME_THICKNESS * scale + sectionWidth + mullionWidth, 
              FRAME_THICKNESS * scale + innerBorderWidth, 
              sectionWidth, 
              (hasTripleTransom ? tripleTransomHeight : innerHeight) - innerBorderWidth * 2, 
              // The middle section can only be opened in triple windows with center-left or center-right
              ["triple", "triple-transom"].includes(windowConfig.id) && 
              ["center-left", "center-right"].includes(hasTripleTransom ? topCasementsOpenable : openableCasements) 
                ? (hasTripleTransom ? topCasementsOpenable : openableCasements)
                : "none",
              hasTripleTransom
            )}
            
            {/* Right section */}
            {renderOpeningIndicator(
              FRAME_THICKNESS * scale + sectionWidth * 2 + mullionWidth * 2 + innerBorderWidth, 
              FRAME_THICKNESS * scale + innerBorderWidth, 
              sectionWidth - innerBorderWidth, 
              (hasTripleTransom ? tripleTransomHeight : innerHeight) - innerBorderWidth * 2, 
              hasTripleTransom ? topCasementsOpenable : openableCasements,
              hasTripleTransom
            )}
            
            {/* Add bottom section opening indicators for transom window */}
            {hasTripleTransom && (
              <>
                {/* Left bottom section */}
                {renderOpeningIndicator(
                  FRAME_THICKNESS * scale + innerBorderWidth, 
                  FRAME_THICKNESS * scale + tripleTransomHeight + mullionWidth + innerBorderWidth, 
                  sectionWidth - innerBorderWidth, 
                  innerHeight - tripleTransomHeight - mullionWidth - innerBorderWidth * 2, 
                  openableCasements
                )}
                
                {/* Middle bottom section */}
                {renderOpeningIndicator(
                  FRAME_THICKNESS * scale + sectionWidth + mullionWidth, 
                  FRAME_THICKNESS * scale + tripleTransomHeight + mullionWidth + innerBorderWidth, 
                  sectionWidth, 
                  innerHeight - tripleTransomHeight - mullionWidth - innerBorderWidth * 2, 
                  // The middle section can only be opened in triple windows with center-left or center-right
                  ["triple", "triple-transom"].includes(windowConfig.id) && 
                  ["center-left", "center-right"].includes(openableCasements) 
                    ? openableCasements
                    : "none"
                )}
                
                {/* Right bottom section */}
                {renderOpeningIndicator(
                  FRAME_THICKNESS * scale + sectionWidth * 2 + mullionWidth * 2 + innerBorderWidth, 
                  FRAME_THICKNESS * scale + tripleTransomHeight + mullionWidth + innerBorderWidth, 
                  sectionWidth - innerBorderWidth, 
                  innerHeight - tripleTransomHeight - mullionWidth - innerBorderWidth * 2, 
                  openableCasements
                )}
              </>
            )}
            
            {/* Georgian bars for each section */}
            {hasGeorgianBars && (
              <>
                {/* Left section */}
                {renderGeorgianBars(
                  FRAME_THICKNESS * scale + innerBorderWidth, 
                  FRAME_THICKNESS * scale + innerBorderWidth, 
                  sectionWidth - innerBorderWidth, 
                  (hasTripleTransom ? tripleTransomHeight : innerHeight) - innerBorderWidth * 2
                )}
                
                {/* Middle section */}
                {renderGeorgianBars(
                  FRAME_THICKNESS * scale + sectionWidth + mullionWidth, 
                  FRAME_THICKNESS * scale + innerBorderWidth, 
                  sectionWidth, 
                  (hasTripleTransom ? tripleTransomHeight : innerHeight) - innerBorderWidth * 2
                )}
                
                {/* Right section */}
                {renderGeorgianBars(
                  FRAME_THICKNESS * scale + sectionWidth * 2 + mullionWidth * 2 + innerBorderWidth, 
                  FRAME_THICKNESS * scale + innerBorderWidth, 
                  sectionWidth - innerBorderWidth, 
                  (hasTripleTransom ? tripleTransomHeight : innerHeight) - innerBorderWidth * 2
                )}
                
                {/* Add bottom section Georgian bars for transom window */}
                {hasTripleTransom && (
                  <>
                    {/* Left bottom section */}
                    {renderGeorgianBars(
                      FRAME_THICKNESS * scale + innerBorderWidth, 
                      FRAME_THICKNESS * scale + tripleTransomHeight + mullionWidth + innerBorderWidth, 
                      sectionWidth - innerBorderWidth, 
                      innerHeight - tripleTransomHeight - mullionWidth - innerBorderWidth * 2
                    )}
                    
                    {/* Middle bottom section */}
                    {renderGeorgianBars(
                      FRAME_THICKNESS * scale + sectionWidth + mullionWidth, 
                      FRAME_THICKNESS * scale + tripleTransomHeight + mullionWidth + innerBorderWidth, 
                      sectionWidth, 
                      innerHeight - tripleTransomHeight - mullionWidth - innerBorderWidth * 2
                    )}
                    
                    {/* Right bottom section */}
                    {renderGeorgianBars(
                      FRAME_THICKNESS * scale + sectionWidth * 2 + mullionWidth * 2 + innerBorderWidth, 
                      FRAME_THICKNESS * scale + tripleTransomHeight + mullionWidth + innerBorderWidth, 
                      sectionWidth - innerBorderWidth, 
                      innerHeight - tripleTransomHeight - mullionWidth - innerBorderWidth * 2
                    )}
                  </>
                )}
              </>
            )}
          </>
        );
      }
      
      case "double":
      case "double-transom": {
        const hasDoubleTransom = windowConfig.id === "double-transom";
        const doubleTransomHeight = hasDoubleTransom ? scaledTransomHeight : 0;
        
        // Calculate section width (accounting for mullion)
        const sectionWidth = (innerWidth - mullionWidth) / 2;
        
        return (
          <>
            {/* Frame */}
            <rect x="0" y="0" width={svgWidth} height={svgHeight} className="window-frame" />
            
            {/* Glass */}
            <rect 
              x={FRAME_THICKNESS * scale} 
              y={FRAME_THICKNESS * scale} 
              width={innerWidth} 
              height={innerHeight} 
              className="window-glass"
              fill={glassType === "Obscure" ? "url(#pattern-obscure)" : "none"}  
            />
            
            {/* Mullions */}
            {/* Vertical mullion */}
            <rect 
              x={(svgWidth / 2) - (mullionWidth / 2)} 
              y={FRAME_THICKNESS * scale} 
              width={mullionWidth} 
              height={innerHeight} 
              className="window-mullion" 
            />
            
            {/* Transom bar if needed */}
            {hasDoubleTransom && (
              <rect 
                x={FRAME_THICKNESS * scale} 
                y={FRAME_THICKNESS * scale + doubleTransomHeight}
                width={innerWidth} 
                height={mullionWidth} 
                className="window-mullion" 
              />
            )}
            
            {/* Internal borders - left section */}
            <rect 
              x={FRAME_THICKNESS * scale} 
              y={FRAME_THICKNESS * scale} 
              width={innerBorderWidth} 
              height={hasDoubleTransom ? doubleTransomHeight : innerHeight} 
              className="inner-border" 
            />
            <rect 
              x={FRAME_THICKNESS * scale} 
              y={FRAME_THICKNESS * scale} 
              width={sectionWidth} 
              height={innerBorderWidth} 
              className="inner-border" 
            />
            
            {/* Internal borders - right section */}
            <rect 
              x={(svgWidth / 2) + (mullionWidth / 2)} 
              y={FRAME_THICKNESS * scale} 
              width={innerBorderWidth} 
              height={hasDoubleTransom ? doubleTransomHeight : innerHeight} 
              className="inner-border" 
            />
            <rect 
              x={(svgWidth / 2) + (mullionWidth / 2)} 
              y={FRAME_THICKNESS * scale} 
              width={sectionWidth} 
              height={innerBorderWidth} 
              className="inner-border" 
            />
            
            {/* Bottom borders */}
            <rect 
              x={FRAME_THICKNESS * scale} 
              y={svgHeight - FRAME_THICKNESS * scale - innerBorderWidth} 
              width={sectionWidth} 
              height={innerBorderWidth} 
              className="inner-border" 
            />
            <rect 
              x={(svgWidth / 2) + (mullionWidth / 2)} 
              y={svgHeight - FRAME_THICKNESS * scale - innerBorderWidth} 
              width={sectionWidth} 
              height={innerBorderWidth} 
              className="inner-border" 
            />
            
            {/* Add bottom internal borders for transom window */}
            {hasDoubleTransom && (
              <>
                <rect 
                  x={FRAME_THICKNESS * scale} 
                  y={FRAME_THICKNESS * scale + doubleTransomHeight + mullionWidth} 
                  width={innerBorderWidth} 
                  height={innerHeight - doubleTransomHeight - mullionWidth} 
                  className="inner-border" 
                />
                <rect 
                  x={(svgWidth / 2) + (mullionWidth / 2)} 
                  y={FRAME_THICKNESS * scale + doubleTransomHeight + mullionWidth} 
                  width={innerBorderWidth} 
                  height={innerHeight - doubleTransomHeight - mullionWidth} 
                  className="inner-border" 
                />
              </>
            )}
            
            {/* Render opening indicators */}
            {/* Left section */}
            {renderOpeningIndicator(
              FRAME_THICKNESS * scale + innerBorderWidth, 
              FRAME_THICKNESS * scale + innerBorderWidth, 
              sectionWidth - innerBorderWidth, 
              (hasDoubleTransom ? doubleTransomHeight : innerHeight) - innerBorderWidth * 2, 
              hasDoubleTransom ? topCasementsOpenable : openableCasements,
              hasDoubleTransom
            )}
            
            {/* Right section */}
            {renderOpeningIndicator(
              (svgWidth / 2) + (mullionWidth / 2) + innerBorderWidth, 
              FRAME_THICKNESS * scale + innerBorderWidth, 
              sectionWidth - innerBorderWidth, 
              (hasDoubleTransom ? doubleTransomHeight : innerHeight) - innerBorderWidth * 2, 
              hasDoubleTransom ? topCasementsOpenable : openableCasements,
              hasDoubleTransom
            )}
            
            {/* Add bottom section opening indicators for transom window */}
            {hasDoubleTransom && (
              <>
                {/* Left bottom section */}
                {renderOpeningIndicator(
                  FRAME_THICKNESS * scale + innerBorderWidth, 
                  FRAME_THICKNESS * scale + doubleTransomHeight + mullionWidth + innerBorderWidth, 
                  sectionWidth - innerBorderWidth, 
                  innerHeight - doubleTransomHeight - mullionWidth - innerBorderWidth * 2, 
                  openableCasements
                )}
                
                {/* Right bottom section */}
                {renderOpeningIndicator(
                  (svgWidth / 2) + (mullionWidth / 2) + innerBorderWidth, 
                  FRAME_THICKNESS * scale + doubleTransomHeight + mullionWidth + innerBorderWidth, 
                  sectionWidth - innerBorderWidth, 
                  innerHeight - doubleTransomHeight - mullionWidth - innerBorderWidth * 2, 
                  openableCasements
                )}
              </>
            )}
            
            {/* Georgian bars for each section */}
            {hasGeorgianBars && (
              <>
                {/* Left section */}
                {renderGeorgianBars(
                  FRAME_THICKNESS * scale + innerBorderWidth, 
                  FRAME_THICKNESS * scale + innerBorderWidth, 
                  sectionWidth - innerBorderWidth, 
                  (hasDoubleTransom ? doubleTransomHeight : innerHeight) - innerBorderWidth * 2
                )}
                
                {/* Right section */}
                {renderGeorgianBars(
                  (svgWidth / 2) + (mullionWidth / 2) + innerBorderWidth, 
                  FRAME_THICKNESS * scale + innerBorderWidth, 
                  sectionWidth - innerBorderWidth, 
                  (hasDoubleTransom ? doubleTransomHeight : innerHeight) - innerBorderWidth * 2
                )}
                
                {/* Add bottom section Georgian bars for transom window */}
                {hasDoubleTransom && (
                  <>
                    {/* Left bottom section */}
                    {renderGeorgianBars(
                      FRAME_THICKNESS * scale + innerBorderWidth, 
                      FRAME_THICKNESS * scale + doubleTransomHeight + mullionWidth + innerBorderWidth, 
                      sectionWidth - innerBorderWidth, 
                      innerHeight - doubleTransomHeight - mullionWidth - innerBorderWidth * 2
                    )}
                    
                    {/* Right bottom section */}
                    {renderGeorgianBars(
                      (svgWidth / 2) + (mullionWidth / 2) + innerBorderWidth, 
                      FRAME_THICKNESS * scale + doubleTransomHeight + mullionWidth + innerBorderWidth, 
                      sectionWidth - innerBorderWidth, 
                      innerHeight - doubleTransomHeight - mullionWidth - innerBorderWidth * 2
                    )}
                  </>
                )}
              </>
            )}
          </>
        );
      }
      
      case "single":
      case "single-transom":
      default: {
        const hasSingleTransom = windowConfig.id === "single-transom";
        const singleTransomHeight = hasSingleTransom ? scaledTransomHeight : 0;
        
        return (
          <>
            {/* Frame */}
            <rect x="0" y="0" width={svgWidth} height={svgHeight} className="window-frame" />
            
            {/* Glass */}
            <rect 
              x={FRAME_THICKNESS * scale} 
              y={FRAME_THICKNESS * scale} 
              width={innerWidth} 
              height={innerHeight} 
              className="window-glass"
              fill={glassType === "Obscure" ? "url(#pattern-obscure)" : "none"}  
            />
            
            {/* Transom bar if needed */}
            {hasSingleTransom && (
              <rect 
                x={FRAME_THICKNESS * scale} 
                y={FRAME_THICKNESS * scale + singleTransomHeight}
                width={innerWidth} 
                height={mullionWidth} 
                className="window-mullion" 
              />
            )}
            
            {/* Internal borders */}
            <rect 
              x={FRAME_THICKNESS * scale} 
              y={FRAME_THICKNESS * scale} 
              width={innerBorderWidth} 
              height={hasSingleTransom ? singleTransomHeight : innerHeight} 
              className="inner-border" 
            />
            <rect 
              x={FRAME_THICKNESS * scale} 
              y={FRAME_THICKNESS * scale} 
              width={innerWidth} 
              height={innerBorderWidth} 
              className="inner-border" 
            />
            <rect 
              x={svgWidth - FRAME_THICKNESS * scale - innerBorderWidth} 
              y={FRAME_THICKNESS * scale} 
              width={innerBorderWidth} 
              height={hasSingleTransom ? singleTransomHeight : innerHeight} 
              className="inner-border" 
            />
            <rect 
              x={FRAME_THICKNESS * scale} 
              y={svgHeight - FRAME_THICKNESS * scale - innerBorderWidth} 
              width={innerWidth} 
              height={innerBorderWidth} 
              className="inner-border" 
            />
            
            {/* Add bottom internal borders for transom window */}
            {hasSingleTransom && (
              <>
                <rect 
                  x={FRAME_THICKNESS * scale} 
                  y={FRAME_THICKNESS * scale + singleTransomHeight + mullionWidth} 
                  width={innerBorderWidth} 
                  height={innerHeight - singleTransomHeight - mullionWidth} 
                  className="inner-border" 
                />
                <rect 
                  x={svgWidth - FRAME_THICKNESS * scale - innerBorderWidth} 
                  y={FRAME_THICKNESS * scale + singleTransomHeight + mullionWidth} 
                  width={innerBorderWidth} 
                  height={innerHeight - singleTransomHeight - mullionWidth} 
                  className="inner-border" 
                />
              </>
            )}
            
            {/* Render opening indicators */}
            {renderOpeningIndicator(
              FRAME_THICKNESS * scale + innerBorderWidth, 
              FRAME_THICKNESS * scale + innerBorderWidth, 
              innerWidth - innerBorderWidth * 2, 
              (hasSingleTransom ? singleTransomHeight : innerHeight) - innerBorderWidth * 2, 
              hasSingleTransom ? topCasementsOpenable : openableCasements,
              hasSingleTransom
            )}
            
            {/* Add bottom section opening indicators for transom window */}
            {hasSingleTransom && 
              renderOpeningIndicator(
                FRAME_THICKNESS * scale + innerBorderWidth, 
                FRAME_THICKNESS * scale + singleTransomHeight + mullionWidth + innerBorderWidth, 
                innerWidth - innerBorderWidth * 2, 
                innerHeight - singleTransomHeight - mullionWidth - innerBorderWidth * 2, 
                openableCasements
              )
            }
            
            {/* Georgian bars */}
            {hasGeorgianBars && 
              renderGeorgianBars(
                FRAME_THICKNESS * scale + innerBorderWidth, 
                FRAME_THICKNESS * scale + innerBorderWidth, 
                innerWidth - innerBorderWidth * 2, 
                (hasSingleTransom ? singleTransomHeight : innerHeight) - innerBorderWidth * 2
              )
            }
            
            {/* Add bottom section Georgian bars for transom window */}
            {hasSingleTransom && hasGeorgianBars && 
              renderGeorgianBars(
                FRAME_THICKNESS * scale + innerBorderWidth, 
                FRAME_THICKNESS * scale + singleTransomHeight + mullionWidth + innerBorderWidth, 
                innerWidth - innerBorderWidth * 2, 
                innerHeight - singleTransomHeight - mullionWidth - innerBorderWidth * 2
              )
            }
          </>
        );
      }
    }
  };

  return (
    <div className="window-drawing">
      <svg 
        width={svgWidth} 
        height={svgHeight + 30} // Extra height for window name
        viewBox={`0 0 ${svgWidth} ${svgHeight + 30}`} 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Pattern for obscure glass */}
          <pattern id="pattern-obscure" patternUnits="userSpaceOnUse" width="10" height="10">
            <path d="M-2,2 l4,-4 M0,10 l10,-10 M8,12 l4,-4" stroke="#ccc" strokeWidth="1" />
          </pattern>
        </defs>
        
        {/* Window Group */}
        <g>
          {renderWindow()}
        </g>
        
        {/* Window dimensions */}
        <text 
          x={svgWidth / 2} 
          y={15} 
          textAnchor="middle" 
          className="dimension-text"
        >
          {formatDimension(width)}
        </text>
        
        <text 
          x={svgWidth - 15} 
          y={svgHeight / 2} 
          textAnchor="middle" 
          transform={`rotate(90, ${svgWidth - 15}, ${svgHeight / 2})`}
          className="dimension-text"
        >
          {formatDimension(height)}
        </text>
        
        {/* Window name */}
        <text 
          x={svgWidth / 2} 
          y={svgHeight + 20} 
          textAnchor="middle" 
          className="window-name"
        >
          {name}
        </text>
      </svg>
    </div>
  );
}