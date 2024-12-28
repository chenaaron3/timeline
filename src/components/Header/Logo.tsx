
import Image from 'next/image';

import logo from '../../../public/logo.png';

export function Logo() {
    return <h1 className="flex items-center justify-center text-2xl text-[--accent-color]">
        <Image src={logo} alt="TimeQuest" className="w-24 h-24" />
    </h1>
}