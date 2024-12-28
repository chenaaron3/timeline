


import { Logo } from './Logo';
import { Menu } from './Menu';
import { Scoreboard } from './Scoreboard';

export function Header() {
    return <div className="relative flex items-center justify-between px-16 pt-3">
        <Logo />
        <Scoreboard />
        <Menu />
    </div>
}