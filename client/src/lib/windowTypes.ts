// Define all available window types with their properties
export const windowTypes = [
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
    id: "fixed",
    name: "Fixed",
    description: "A window that doesn't open",
    minWidth: 400,
    maxWidth: 2000,
    minHeight: 400,
    maxHeight: 2000,
  },
  {
    id: "sliding",
    name: "Sliding",
    description: "A window with panes that slide horizontally",
    minWidth: 800,
    maxWidth: 2500,
    minHeight: 500,
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
