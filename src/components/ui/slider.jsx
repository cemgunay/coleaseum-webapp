import React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/utils/utils';

const Slider = React.forwardRef(({
    className, min, max, step, formatLabel, value, onValueChange, onValueCommit, showLabel = true, ...props
}, ref) => {
    // Handle value change directly from props, removing the local state management
    const handleValueChange = (newValues) => {
        if (onValueChange) {
            onValueChange(newValues);
        }
    };

    const handleValueCommit = (newValues) => {
        if(onValueCommit){
            onValueCommit(newValues)
        }
    }

    return (
        <SliderPrimitive.Root
            ref={ref}
            min={min}
            max={max}
            step={step}
            value={value} // Use value prop directly
            onValueChange={handleValueChange}
            onValueCommit={handleValueCommit}
            className={cn('relative flex w-full touch-none select-none items-center', className)}
            {...props}
        >
            <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
                <SliderPrimitive.Range className="absolute h-full bg-primary" />
            </SliderPrimitive.Track>
            {value.map((value, index) => (
                <React.Fragment key={index}>
                    {showLabel && (
                        <div className="absolute text-center" style={{ left: `calc(${((value - min) / (max - min)) * 100}% + 0px)`, top: `10px` }}>
                            <span className="text-xs">{formatLabel ? formatLabel(value) : value}</span>
                        </div>
                    )}
                    <SliderPrimitive.Thumb
                        className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    />
                </React.Fragment>
            ))}
        </SliderPrimitive.Root>
    );
});

Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
