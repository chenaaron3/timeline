import Image from 'next/image';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '~/components/ui/dialog';
import { Separator } from '~/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';
import { useGameStore } from '~/state';
import { prettyPrintNumber } from '~/utils/utils';

import { Button } from '../ui/button';
import { Typewriter } from './Typewriter';

export function Details() {
    const displayedCard = useGameStore.use.displayedCard();
    const acknowledgeCard = useGameStore.use.acknowledgeCard();

    if (displayedCard == undefined) {
        return <></>;
    }

    return (
        // Can also close dialog with escape
        <Dialog defaultOpen onOpenChange={() => { acknowledgeCard() }}>
            <DialogContent id="details-modal">
                <DialogHeader>
                    <DialogTitle>
                        <div className='sm:text-3xl'>
                            <span>{displayedCard.title}</span>
                            <span className='ml-1'>({prettyPrintNumber(displayedCard.rank)})</span>
                        </div>
                    </DialogTitle>
                    <Separator />
                    <DialogDescription>
                        <div className='flex flex-col items-center justify-center gap-3 py-3 sm:flex-row sm:gap-10'>
                            <div className='w-2/3 sm:w-1/2 flex justify-center items-center'>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            {/* eslint-disable-next-line */}
                                            <Image src={displayedCard.image}
                                                alt={displayedCard.title}
                                                className='rounded-3xl min-w-32 sm:min-w-64'
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{displayedCard.imagePrompt}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div className='flex p-2 w-full flex-col items-center justify-start sm:justify-center overflow-auto max-h-48 sm:max-h-96 sm:w-1/2 sm:text-lg'>
                                <Typewriter shortText={displayedCard.description} longText={displayedCard.longDescription} />
                            </div>
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="submit" onClick={acknowledgeCard}>Got It!</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}