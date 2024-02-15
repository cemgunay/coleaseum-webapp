import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/utils/utils";
import { format } from "date-fns";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef(({ className, ...props }, ref) => (
    <AccordionPrimitive.Item
        ref={ref}
        className={cn("rounded-2xl bg-slate-200 border-0 px-4", className)}
        {...props}
    />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef(
    ({ className, children, label, selectedDates, selectedLocation, ...props }, ref) => {
      // State to track accordion open or closed
      const [isOpen, setIsOpen] = React.useState(false);
  
      // Adjust based on the Accordion's open state
      const onTriggerClick = () => setIsOpen(!isOpen);
  
      const renderRightSideContent = () => {
        if (selectedDates) {
          // If dates are selected, return formatted string and hide the Chevron
          if(selectedDates.to) {
            
            const from = format(selectedDates.from, "LLL dd")
          const to = format(selectedDates.to, "LLL dd")
          return `${from} - ${to}`
          }
          if(selectedDates.from){
            const from = format(selectedDates.from, "LLL dd")
            return `${from} - `
            
          }
          
        } else if (selectedLocation) {
          // If location is selected, return it and hide the Chevron
          return selectedLocation;
        } else if (label){
            return label;
        }
        // If nothing is selected, return null to show the Chevron
        return null;
      };
  
      const rightSideContent = renderRightSideContent();
  
      return (
        <AccordionPrimitive.Header className="flex" onClick={onTriggerClick}>
          <AccordionPrimitive.Trigger
            ref={ref}
            className={cn(
              "flex flex-1 items-center justify-between py-4 font-medium transition-all",
              className
            )}
            {...props}
          >
            {children}
            <span className="flex items-center">
              {rightSideContent !== null ? (
                <span className="text-sm mr-2">{rightSideContent}</span>
              ) : (
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              )}
            </span>
          </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
      );
    }
  );
  
  AccordionTrigger.displayName = "AccordionTrigger";
  
  
  

const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Content
        ref={ref}
        className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
        {...props}
    >
        <div className={cn("pb-4 pt-0", className)}>{children}</div>
    </AccordionPrimitive.Content>
));

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
