
import { Menu } from '../components/Menu';
import { Scoreboard } from '../components/Scoreboard';

export function Header() {
    return <div className="relative flex items-center justify-between px-16 pt-12">
        <h1 className="text-2xl">
            TimeQuest
        </h1>
        <Scoreboard />
        <Menu />
    </div>
}