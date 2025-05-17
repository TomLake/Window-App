import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useEffect } from "react";
import { windowTypes } from "@/lib/windowTypes";
import type { Window } from "@shared/schema";

// Extended schema for form validation
const windowFormSchema = z.object({
  id: z.number().optional(),
  projectId: z.number().default(1), // Default project ID
  name: z.string().default("New Window"),
  type: z.string().min(1, "Type is required"),
  width: z.coerce.number().min(300, "Width must be at least 300mm").max(3000, "Width must be at most 3000mm"),
  height: z.coerce.number().min(300, "Height must be at least 300mm").max(3000, "Height must be at most 3000mm"),
  // location field removed
  glassType: z.string().min(1, "Glass type is required"),
  openableCasements: z.string().default("left"),
  hasGeorgianBars: z.boolean().default(false),
  georgianBarsHorizontal: z.coerce.number().min(0).max(4).default(1),
  georgianBarsVertical: z.coerce.number().min(0).max(4).default(1),
  // Optional transom height parameter for transom window types
  transomHeight: z.coerce.number().min(200, "Transom height must be at least 200mm").max(1000, "Transom height must be at most 1000mm").default(400).optional(),
  positionX: z.number().default(0),
  positionY: z.number().default(0),
});

type WindowFormValues = z.infer<typeof windowFormSchema>;

interface WindowFormProps {
  selectedWindow: Window | null;
  onSave: (data: WindowFormValues) => void;
  onReset: () => void;
}

export default function WindowForm({ selectedWindow, onSave, onReset }: WindowFormProps) {
  const defaultValues: WindowFormValues = {
    projectId: 1,
    name: "",
    type: "single",
    width: 1100,
    height: 1100,
    glassType: "Clear",
    openableCasements: "left",
    hasGeorgianBars: false,
    georgianBarsHorizontal: 1,
    georgianBarsVertical: 1,
    positionX: 0,
    positionY: 0,
  };

  const form = useForm<WindowFormValues>({
    resolver: zodResolver(windowFormSchema),
    defaultValues,
  });

  // Update form when selected window changes
  useEffect(() => {
    if (selectedWindow) {
      // Ensure all properties have proper types
      // Need to convert types to match form expectations
      const windowData: WindowFormValues = {
        id: selectedWindow.id,
        projectId: selectedWindow.projectId,
        name: selectedWindow.name,
        type: selectedWindow.type,
        width: selectedWindow.width,
        height: selectedWindow.height,
        glassType: selectedWindow.glassType,
        openableCasements: selectedWindow.openableCasements || "left",
        hasGeorgianBars: selectedWindow.hasGeorgianBars === true,
        georgianBarsHorizontal: selectedWindow.georgianBarsHorizontal ?? 1,
        georgianBarsVertical: selectedWindow.georgianBarsVertical ?? 1,
        transomHeight: selectedWindow.transomHeight ?? 400,
        positionX: selectedWindow.positionX ?? 0,
        positionY: selectedWindow.positionY ?? 0
      };
      form.reset(windowData);
    }
  }, [selectedWindow, form]);

  const handleReset = () => {
    form.reset(defaultValues);
    onReset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Window Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select window type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {windowTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Window Name</FormLabel>
              <FormControl>
                <Input placeholder="Kitchen Window" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="width"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Width (mm)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Height (mm)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Location field removed */}

        <FormField
          control={form.control}
          name="glassType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Glass Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select glass type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Clear">Clear</SelectItem>
                  <SelectItem value="Obscure">Obscure</SelectItem>
                  <SelectItem value="Tinted">Tinted</SelectItem>
                  <SelectItem value="Low-E">Low-E</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        

        
        <FormField
          control={form.control}
          name="openableCasements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Openable Casements</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select which casements open" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="left">Left Only</SelectItem>
                  <SelectItem value="right">Right Only</SelectItem>
                  <SelectItem value="both">Both Left and Right</SelectItem>
                  <SelectItem value="none">None (Fixed)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Specify which casements of the window can open
              </FormDescription>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="hasGeorgianBars"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Georgian Bars</FormLabel>
                <FormDescription>
                  Add decorative Georgian bars to the window
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        {form.watch("hasGeorgianBars") && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="georgianBarsHorizontal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horizontal Bars</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="4"
                      value={field.value}
                      onChange={(e) => {
                        const value = !isNaN(e.target.valueAsNumber) ? e.target.valueAsNumber : 0;
                        field.onChange(value);
                      }}
                      onBlur={field.onBlur}
                    />
                  </FormControl>
                  <FormDescription>Number of horizontal bars</FormDescription>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="georgianBarsVertical"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vertical Bars</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="4"
                      value={field.value}
                      onChange={(e) => {
                        const value = !isNaN(e.target.valueAsNumber) ? e.target.valueAsNumber : 0;
                        field.onChange(value);
                      }}
                      onBlur={field.onBlur}
                    />
                  </FormControl>
                  <FormDescription>Number of vertical bars</FormDescription>
                </FormItem>
              )}
            />
          </div>
        )}
        
{/* Transom height parameter - only visible for transom window types */}
        {(form.watch("type") === "single-transom" || 
          form.watch("type") === "double-transom" || 
          form.watch("type") === "triple-transom") && (
          <FormField
            control={form.control}
            name="transomHeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transom Height (mm)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="200"
                    max="1000"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Height of transom section from top of window (default: 400mm)
                </FormDescription>
              </FormItem>
            )}
          />
        )}
        


        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button type="submit">
            {selectedWindow?.id ? 'Update Window' : 'Add Window'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
