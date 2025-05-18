// Define all available window types with their properties
export const windowTypes = [
  // Standard window types
  {
    id: "single",
    name: "Single Casement",
    description: "A single pane window that opens outward",
    minWidth: 400,
    maxWidth: 1000,
    minHeight: 500,
    maxHeight: 2000,
  },
  {
    id: "double",
    name: "Double Casement",
    description: "A window with two panes side by side, both can open outward",
    minWidth: 800,
    maxWidth: 2000,
    minHeight: 500,
    maxHeight: 2000,
  },
  {
    id: "triple",
    name: "Triple Casement",
    description: "A window with three panes side by side",
    minWidth: 1200,
    maxWidth: 2500,
    minHeight: 500,
    maxHeight: 2000,
  },
  {
    id: "quad",
    name: "Quad Casement",
    description: "A window with four equal panes side by side",
    minWidth: 1600,
    maxWidth: 3000,
    minHeight: 500,
    maxHeight: 2000,
  },
  
  // Transom window types
  {
    id: "single-transom",
    name: "Single with Transom",
    description: "A single casement window with a fixed rectangular transom at the top",
    minWidth: 400,
    maxWidth: 1000,
    minHeight: 800,
    maxHeight: 2000,
  },
  {
    id: "double-transom",
    name: "Double with Transom",
    description: "A double casement window with a fixed rectangular transom at the top",
    minWidth: 800,
    maxWidth: 2000,
    minHeight: 800,
    maxHeight: 2000,
  },
  {
    id: "triple-transom",
    name: "Triple with Transom",
    description: "A triple casement window with a fixed rectangular transom at the top",
    minWidth: 1200,
    maxWidth: 2500,
    minHeight: 800,
    maxHeight: 2000,
  },
  {
    id: "quad-transom",
    name: "Quad with Transom",
    description: "A quad casement window with a fixed rectangular transom at the top",
    minWidth: 1600,
    maxWidth: 3000,
    minHeight: 800,
    maxHeight: 2000,
  },
  
  {
    id: "patio",
    name: "Patio Doors",
    description: "Large glass doors for patio access",
    minWidth: 1500,
    maxWidth: 3000,
    minHeight: 2000,
    maxHeight: 2500,
  }
];

// Get window type by ID
export function getWindowTypeById(id: string) {
  return windowTypes.find(type => type.id === id) || windowTypes[0];
}
