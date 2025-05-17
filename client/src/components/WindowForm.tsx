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
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  width: z.coerce.number().min(300, "Width must be at least 300mm").max(3000, "Width must be at most 3000mm"),
  height: z.coerce.number().min(300, "Height must be at least 300mm").max(3000, "Height must be at most 3000mm"),
  location: z.string().min(1, "Location is required"),
  glassType: z.string().min(1, "Glass type is required"),
  hasGeorgianBars: z.boolean().default(false),
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
    location: "Living Room",
    glassType: "Clear",
    hasGeorgianBars: false,
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
      const windowData = {
        ...selectedWindow,
        hasGeorgianBars: selectedWindow.hasGeorgianBars === true,
        positionX: selectedWindow.positionX || 0,
        positionY: selectedWindow.positionY || 0
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

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Location</FormLabel>
              <FormControl>
                <Input placeholder="Kitchen" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

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
