import { Boxes, Menu as MenuIcon, Plus } from 'lucide-react';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';

export function Menu() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <MenuIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <Plus />
                        <span>Invite Player</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Boxes />
                        <span>Browse Decks</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
