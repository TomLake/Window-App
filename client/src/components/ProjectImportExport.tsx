import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Window } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { saveAs } from 'file-saver';
import { Download, Upload, Copy, Check } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface ProjectImportExportProps {
  windows: Window[];
  projectName: string;
  onImportComplete: () => void;
}

// Convert windows array to XML format
const windowsToXml = (windows: Window[], projectName: string): string => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<project name="${escapeXml(projectName)}">\n`;
  
  windows.forEach(window => {
    xml += `  <window>\n`;
    xml += `    <id>${window.id}</id>\n`;
    xml += `    <projectId>${window.projectId}</projectId>\n`;
    xml += `    <name>${escapeXml(window.name)}</name>\n`;
    xml += `    <type>${escapeXml(window.type)}</type>\n`;
    xml += `    <width>${window.width}</width>\n`;
    xml += `    <height>${window.height}</height>\n`;
    xml += `    <glassType>${escapeXml(window.glassType)}</glassType>\n`;
    xml += `    <hasGeorgianBars>${window.hasGeorgianBars}</hasGeorgianBars>\n`;
    xml += `    <georgianBarsHorizontal>${window.georgianBarsHorizontal || 1}</georgianBarsHorizontal>\n`;
    xml += `    <georgianBarsVertical>${window.georgianBarsVertical || 1}</georgianBarsVertical>\n`;
    xml += `    <openableCasements>${escapeXml(window.openableCasements || 'left')}</openableCasements>\n`;
    xml += `    <transomHeight>${window.transomHeight || 400}</transomHeight>\n`;
    xml += `    <topCasementsOpenable>${escapeXml(window.topCasementsOpenable || 'none')}</topCasementsOpenable>\n`;
    xml += `    <positionX>${window.positionX || 0}</positionX>\n`;
    xml += `    <positionY>${window.positionY || 0}</positionY>\n`;
    xml += `  </window>\n`;
  });
  
  xml += `</project>`;
  return xml;
};

// Helper function to escape XML special characters
const escapeXml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

// Parse XML string back to windows array
const xmlToWindows = (xml: string): { windows: Omit<Window, 'id'>[]; projectName: string } => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, 'text/xml');
  
  const projectElement = xmlDoc.getElementsByTagName('project')[0];
  const projectName = projectElement.getAttribute('name') || 'Imported Project';
  
  const windowElements = xmlDoc.getElementsByTagName('window');
  const windows: Omit<Window, 'id'>[] = [];
  
  for (let i = 0; i < windowElements.length; i++) {
    const windowEl = windowElements[i];
    
    const getElementValue = (tagName: string, defaultValue: any = '') => {
      const element = windowEl.getElementsByTagName(tagName)[0];
      return element ? element.textContent || defaultValue : defaultValue;
    };
    
    const getBooleanValue = (tagName: string, defaultValue: boolean = false) => {
      const value = getElementValue(tagName, defaultValue.toString());
      return value === 'true';
    };
    
    const getNumberValue = (tagName: string, defaultValue: number = 0) => {
      const value = getElementValue(tagName, defaultValue.toString());
      return parseInt(value, 10);
    };
    
    // Extract window data
    const window: Omit<Window, 'id'> = {
      projectId: getNumberValue('projectId', 1),
      name: getElementValue('name'),
      type: getElementValue('type', 'single'),
      width: getNumberValue('width', 1000),
      height: getNumberValue('height', 1200),
      glassType: getElementValue('glassType', 'clear'),
      hasGeorgianBars: getBooleanValue('hasGeorgianBars'),
      georgianBarsHorizontal: getNumberValue('georgianBarsHorizontal', 1),
      georgianBarsVertical: getNumberValue('georgianBarsVertical', 1),
      openableCasements: getElementValue('openableCasements', 'left'),
      transomHeight: getNumberValue('transomHeight', 400),
      topCasementsOpenable: getElementValue('topCasementsOpenable', 'none'),
      positionX: getNumberValue('positionX', 0),
      positionY: getNumberValue('positionY', 0)
    };
    
    windows.push(window);
  }
  
  return { windows, projectName };
};

export default function ProjectImportExport({ windows, projectName, onImportComplete }: ProjectImportExportProps) {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [xmlContent, setXmlContent] = useState('');
  const [importXml, setImportXml] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Handle export functionality
  const handleExport = () => {
    const xml = windowsToXml(windows, projectName);
    setXmlContent(xml);
    setIsExportOpen(true);
  };
  
  // Save XML to file
  const handleSaveToFile = () => {
    const blob = new Blob([xmlContent], { type: 'text/xml;charset=utf-8' });
    saveAs(blob, `${projectName.replace(/\s+/g, '_')}_windows.xml`);
    setIsExportOpen(false);
    toast({
      title: "XML Exported",
      description: `Project "${projectName}" has been exported as XML file`
    });
  };
  
  // Copy XML to clipboard
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "XML content has been copied to clipboard"
    });
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Import from XML
  const importWindowMutation = useMutation({
    mutationFn: async (windowData: Omit<Window, 'id'>) => {
      return apiRequest('POST', '/api/windows', windowData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/windows'] });
    }
  });
  
  const handleImport = () => {
    setIsImportOpen(true);
  };
  
  const processImport = async () => {
    try {
      const { windows: importedWindows } = xmlToWindows(importXml);
      
      // Import each window sequentially
      for (const windowData of importedWindows) {
        await importWindowMutation.mutateAsync(windowData);
      }
      
      setIsImportOpen(false);
      setImportXml('');
      toast({
        title: "Import Successful",
        description: `Imported ${importedWindows.length} windows successfully`
      });
      onImportComplete();
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import windows from XML",
        variant: "destructive"
      });
    }
  };
  
  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportXml(content);
    };
    reader.readAsText(file);
  };
  
  // Trigger file input click
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <>
      {/* Export Button */}
      <Button 
        onClick={handleExport}
        variant="outline"
        className="flex items-center gap-1"
        disabled={windows.length === 0}
      >
        <Download size={16} />
        <span>Export XML</span>
      </Button>
      
      {/* Import Button */}
      <Button 
        onClick={handleImport}
        variant="outline"
        className="flex items-center gap-1"
      >
        <Upload size={16} />
        <span>Import XML</span>
      </Button>
      
      {/* Hidden file input */}
      <input 
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".xml"
        onChange={handleFileChange}
      />
      
      {/* Export Dialog */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Export Project as XML</DialogTitle>
            <DialogDescription>
              Your project data has been converted to XML format. You can copy it to clipboard or save it as a file.
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-4">
            <Textarea 
              value={xmlContent}
              readOnly
              className="h-64 font-mono text-sm"
            />
          </div>
          
          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCopyToClipboard}
                className="flex items-center gap-1"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </Button>
              
              <Button 
                onClick={handleSaveToFile}
                className="flex items-center gap-1"
              >
                <Download size={16} />
                Save as File
              </Button>
            </div>
            
            <Button variant="outline" onClick={() => setIsExportOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Import Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Import Project from XML</DialogTitle>
            <DialogDescription>
              Paste XML content below or select an XML file to import window designs.
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-4">
            <Button 
              variant="outline" 
              onClick={handleFileButtonClick}
              className="w-full mb-4"
            >
              Select XML File
            </Button>
            
            <Textarea 
              value={importXml}
              onChange={(e) => setImportXml(e.target.value)}
              placeholder="Paste XML content here..."
              className="h-64 font-mono text-sm"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportOpen(false)}>
              Cancel
            </Button>
            
            <Button 
              onClick={processImport}
              disabled={!importXml.trim()}
            >
              Import Windows
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}