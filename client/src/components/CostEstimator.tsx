import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Window } from '@shared/schema';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CostEstimatorProps {
  windows: Window[];
  projectName: string;
}

// Calculate base cost based on window type and dimensions
const calculateWindowCost = (window: Window, materialType: string): number => {
  const area = (window.width / 1000) * (window.height / 1000); // Convert to square meters
  let baseCost = 0;
  
  // Base costs depend on window type
  switch (window.type) {
    case 'single':
      baseCost = 350 * area;
      break;
    case 'double':
      baseCost = 400 * area;
      break;
    case 'triple':
      baseCost = 450 * area;
      break;
    case 'triple-transom':
    case 'double-transom':
    case 'single-transom':
      baseCost = 500 * area; // Transom windows cost more
      break;
    case 'quad':
    case 'quad-transom':
      baseCost = 550 * area;
      break;
    case 'door-fully-boarded':
      baseCost = 800;
      break;
    case 'door-full-glazed':
      baseCost = 900;
      break;
    case 'door-half-glazed':
      baseCost = 950;
      break;
    case 'door-6-panel':
      baseCost = 1000;
      break;
    default:
      baseCost = 300 * area;
  }
  
  // Apply material cost multiplier
  switch (materialType) {
    case 'softwood':
      return baseCost;
    case 'hardwood':
      return baseCost * 1.2;
    case 'hybrid':
      return baseCost * 1.4;
    default:
      return baseCost;
  }
};

// Additional costs for features
const calculateFeatureCosts = (window: Window): number => {
  let additionalCost = 0;
  
  // Georgian bars add cost
  if (window.hasGeorgianBars) {
    // Use non-nullish coalescing to handle potential null values
    const horizontalBars = window.georgianBarsHorizontal ?? 1;
    const verticalBars = window.georgianBarsVertical ?? 1;
    const barComplexity = horizontalBars * verticalBars;
    additionalCost += 50 * barComplexity;
  }
  
  // Different glass types add cost
  if (window.glassType !== 'clear') {
    additionalCost += 30;
  }
  
  // Opening casements add cost
  if (window.openableCasements !== 'none') {
    const numOpenable = window.openableCasements === 'both' ? 2 : 1;
    additionalCost += 40 * numOpenable;
  }
  
  // Top casements in transom windows
  if (window.type.includes('transom') && window.topCasementsOpenable !== 'none') {
    const numTopOpenable = window.topCasementsOpenable === 'both' ? 2 : 1;
    additionalCost += 45 * numTopOpenable;
  }
  
  return additionalCost;
};

// Count window types for summary
const countWindowTypes = (windows: Window[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  
  windows.forEach(window => {
    // Group similar types together for a cleaner summary
    let type = window.type;
    
    // Simplify the types for the summary
    if (type.includes('transom')) {
      type = 'transom window';
    } else if (type === 'single') {
      type = 'single casement window';
    } else if (type === 'double') {
      type = 'double casement window';
    } else if (type === 'triple') {
      type = 'triple casement window';
    } else if (type === 'quad') {
      type = 'quad casement window';
    } else if (type.includes('door')) {
      type = 'door';
    }
    
    counts[type] = (counts[type] || 0) + 1;
  });
  
  return counts;
};

// Generate an email quote
const generateEmailQuote = (
  customerName: string,
  projectName: string,
  windows: Window[],
  materialType: string,
  totalCostSoftwood: number,
  totalCostHardwood: number,
  totalCostHybrid: number
): string => {
  const windowCounts = countWindowTypes(windows);
  const windowSummary = Object.entries(windowCounts)
    .map(([type, count]) => `${count}no ${type}`)
    .join(', ');
  
  return `Hi ${customerName},

Thanks for the email.

Here are some options for your ${projectName} project. The prices are estimates as I haven't seen the windows to quote accurately.

Supply only ${windowSummary}. Including sealed glass units, ironmongery, and 1 coat of primer.
Softwood with hardwood sills/beads: £${Math.round(totalCostSoftwood).toLocaleString()} + VAT
All hardwood: £${Math.round(totalCostHardwood).toLocaleString()} + VAT
Hardwood frames with Accoya doors and casements: £${Math.round(totalCostHybrid).toLocaleString()} + VAT

Accoya is an amazing timber that will basically never rot, extremely dimensionally stable, and holds paint better. Our most common windows now use hardwood for the framework and Accoya for the casements and doors. www.accoya.co.uk

Regards,
Tom`;
};

export default function CostEstimator({ windows, projectName }: CostEstimatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [materialType, setMaterialType] = useState('softwood');
  const [emailQuote, setEmailQuote] = useState('');
  const { toast } = useToast();

  const calculateTotalCost = (material: string): number => {
    return windows.reduce((total, window) => {
      const windowBaseCost = calculateWindowCost(window, material);
      const featureCosts = calculateFeatureCosts(window);
      return total + windowBaseCost + featureCosts;
    }, 0);
  };

  const handleGenerateQuote = () => {
    const totalCostSoftwood = calculateTotalCost('softwood');
    const totalCostHardwood = calculateTotalCost('hardwood');
    const totalCostHybrid = calculateTotalCost('hybrid');
    
    const quote = generateEmailQuote(
      customerName || 'Customer',
      projectName || 'Window Project',
      windows,
      materialType,
      totalCostSoftwood,
      totalCostHardwood,
      totalCostHybrid
    );
    
    setEmailQuote(quote);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(emailQuote);
    toast({
      title: "Copied to clipboard",
      description: "The quote has been copied to your clipboard."
    });
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700"
      >
        Estimate Cost & Generate Quote
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Window Cost Estimation</DialogTitle>
            <DialogDescription>
              Generate cost estimates and an email quote for your window project.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customerName" className="text-right">
                Customer Name
              </Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="materialType" className="text-right">
                Primary Material
              </Label>
              <Select
                value={materialType}
                onValueChange={setMaterialType}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="softwood">Softwood with hardwood sills/beads</SelectItem>
                  <SelectItem value="hardwood">All hardwood</SelectItem>
                  <SelectItem value="hybrid">Hardwood frames with Accoya casements</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Cost Summary</h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Softwood with hardwood sills/beads:</span>
                      <span>£{Math.round(calculateTotalCost('softwood')).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>All hardwood:</span>
                      <span>£{Math.round(calculateTotalCost('hardwood')).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hardwood frames with Accoya casements:</span>
                      <span>£{Math.round(calculateTotalCost('hybrid')).toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      *All prices are exclusive of VAT
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Button 
              onClick={handleGenerateQuote}
              className="mt-4 w-full"
            >
              Generate Email Quote
            </Button>
            
            {emailQuote && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">Email Quote</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="flex items-center gap-1"
                  >
                    <Copy size={14} /> Copy
                  </Button>
                </div>
                <Textarea 
                  value={emailQuote}
                  readOnly
                  className="h-64 font-mono text-sm"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}