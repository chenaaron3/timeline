import { useMediaQuery } from 'react-responsive';

export function useMediaQueries() {
    // Media Queries
    const isSmallScreen = useMediaQuery({ maxWidth: 639 });
    const isMediumScreen = useMediaQuery({ maxWidth: 767 });
    const isLargecreen = useMediaQuery({ maxWidth: 1023 });
    const isExtraLargecreen = useMediaQuery({ maxWidth: 1279 });
    const isExtraExtraLargecreen = useMediaQuery({ maxWidth: 1535 });

    return {
        isSmallScreen,
        isMediumScreen,
        isLargecreen,
        isExtraLargecreen,
        isExtraExtraLargecreen
    }
}