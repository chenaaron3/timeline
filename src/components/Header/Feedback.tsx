import { MessageCircleWarning } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { api } from '~/utils/api';

import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
    feedback: z.string().min(2).max(256),
})

export const Feedback = () => {
    const createFeedback = api.feedback.create.useMutation();
    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            feedback: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        toast.success("Thank you for your feedback!");

        // Submit the feedback and reset the form
        createFeedback.mutate({ comments: values.feedback });
        form.reset();
        setOpen(false);
    }

    return <Popover open={open} onOpenChange={e => setOpen(e)}>
        <PopoverTrigger asChild>
            <MessageCircleWarning className='cursor-pointer' />
        </PopoverTrigger>
        <PopoverContent onOpenAutoFocus={e => e.preventDefault()} className="w-80">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="">
                    <FormField
                        control={form.control}
                        name="feedback"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    <h4 className="font-medium leading-none">Feedback</h4>
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="Deck suggestions or feature requests..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
        </PopoverContent>
    </Popover>
}