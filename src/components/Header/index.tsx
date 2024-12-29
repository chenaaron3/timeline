


import { Logo } from './Logo';
import { Menu } from './Menu';
import { Scoreboard } from './Scoreboard';

export function Header() {
    return <div className="relative flex items-center justify-between h-32 px-8 pt-3 lg:px-16 sm:h-fit">
        <Logo />
        <Scoreboard />
        <Menu />
    </div>
}