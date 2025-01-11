import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';

interface SimpleTooltipProps {
    children: React.ReactNode;
    description: string;
    delayDuration?: number;
}

export const SimpleTooltip: React.FC<SimpleTooltipProps> = ({
    children, description, delayDuration = 100
}) => {
    return <TooltipProvider delayDuration={delayDuration}>
        <Tooltip>
            <TooltipTrigger>
                {children}
            </TooltipTrigger>
            <TooltipContent>
                {description}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
}