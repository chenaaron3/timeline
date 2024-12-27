import { useGameStore } from '~/state';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import Image from 'next/image';
import { Typewriter } from './Typewriter';
import { Separator } from "~/components/ui/separator"

export function Details() {
    const displayedCard = useGameStore.use.displayedCard();
    const acknowledgeCard = useGameStore.use.acknowledgeCard();

    if (displayedCard == undefined) {
        return <></>;
    }

    return (
        <AlertDialog defaultOpen>
            <AlertDialogContent className=''>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        <span>{displayedCard.title}</span>
                        <span className='ml-1'>({displayedCard.year})</span>
                    </AlertDialogTitle>
                    <Separator />
                    <AlertDialogDescription>
                        <div className='flex items-center justify-center gap-10'>
                            <div className='w-1/2'>
                                <Image src={displayedCard.image} alt={displayedCard.title} className='rounded-3xl' />
                            </div>
                            <div className='flex flex-col items-center justify-center w-1/2 h-64'>
                                <Typewriter shortText={displayedCard.description} longText={displayedCard.longDescription} />
                            </div>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={acknowledgeCard}>
                        Got It!
                    </AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}