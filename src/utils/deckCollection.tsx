import { Brain, Earth, EarthLock, Swords, User, UsersRound } from 'lucide-react';
import LeagueData from '~/data/league.json';
import OldWorldHistoryData from '~/data/old_world_history.json';
import PhilosophersData from '~/data/philosophers.json';
import RedditCommunitesData from '~/data/reddit_communities.json';
import USPresidents from '~/data/us_president_inaugurations.json';
import WorldHistoryData from '~/data/world_history.json';
import { IMAGE_MAP as leagueImageMap } from '~/generated/LeagueImages';
import { IMAGE_MAP as oldWorldHistoryImageMap } from '~/generated/OldWorldHistoryImages';
import { IMAGE_MAP as philosophersImageMap } from '~/generated/PhilosophersImages';
import { IMAGE_MAP as redditCommunitiesImageMap } from '~/generated/RedditCommunitiesImages';
import { IMAGE_MAP as usPresidentsImageMap } from '~/generated/UsPresidentInaugurationsImages';
import { IMAGE_MAP as worldHistoryImageMap } from '~/generated/WorldHistoryImages';

import { Event, Events, ImageMap } from './types';

export type DECK_NAMES = "world_history" | "old_world_history" | "us_presidents" | "philosophers" | "reddit_communities" | "NULL_DECK";

export interface DisplayDecks {
    id: DECK_NAMES;
    name: string;
    icon: React.ReactNode;
    imageMap?: ImageMap;
    deckData: Events;
    instruction: string;
    comparisonType: "date" | "count";
    rankKey?: (e: Event) => number; // If a different key should be used to get the rank
    // Blog Data should be SEO optimized
    blogData?: {
        title: string;
        description: string;
        date: string;
    }
}

export const DISPLAY_DECKS = [
    {
        id: 'world_history',
        name: 'World History',
        icon: <Earth />,
        imageMap: worldHistoryImageMap,
        deckData: WorldHistoryData,
        instruction: "Which Historical Event Came First?",
        comparisonType: "date",
        blogData: {
            title: "Most Significant World History Events",
            description: `Explore the pivotal moments in world history that shaped 
            our present and continue to influence our future. From ancient civilizations 
            to modern times, this blog dives into the most significant events that altered 
            the course of nations, cultures, and humanity itself. Gain deeper insights into 
            the wars, discoveries, revolutions, and movements that have left a lasting legacy 
            on the world stage.`,
            date: "January 1, 2025",
        }
    },
    {
        id: 'old_world_history',
        name: 'World History (Hard)',
        icon: <EarthLock />,
        imageMap: oldWorldHistoryImageMap,
        deckData: OldWorldHistoryData,
        instruction: "Which Historical Event Came First?",
        comparisonType: "date",
    },
    {
        id: 'philosophers',
        name: 'Philosophers',
        icon: <Brain />,
        imageMap: philosophersImageMap,
        deckData: PhilosophersData,
        instruction: "Which Philosopher Came First?",
        comparisonType: "date",
    },
    {
        id: 'reddit_communities',
        name: 'Reddit Communities',
        icon: <UsersRound />,
        deckData: RedditCommunitesData,
        imageMap: redditCommunitiesImageMap,
        instruction: "Which Subreddit Has More Subscribers?",
        comparisonType: "count",
    },
    {
        id: 'league_most_played',
        name: 'Most Played League Champions',
        icon: <Swords />,
        deckData: LeagueData,
        imageMap: leagueImageMap,
        instruction: "Which Champion Is Played More?",
        comparisonType: "count",
        rankKey: (e: Event) => e.play
    },
    {
        id: 'league_most_damage',
        name: 'Most Damage Dealt League Champions',
        icon: <Swords />,
        deckData: LeagueData,
        imageMap: leagueImageMap,
        instruction: "Which Champion Deals More Damage Per Game?",
        comparisonType: "count",
        rankKey: (e: Event) => (e.damage_dealt_to_champions! / e.play!)
    },
    {
        id: 'league_most_taken',
        name: 'Most Damage Taken League Champions',
        icon: <Swords />,
        deckData: LeagueData,
        imageMap: leagueImageMap,
        instruction: "Which Champion Takes More Damage Per Game?",
        comparisonType: "count",
        rankKey: (e: Event) => (e.damage_taken! / e.play!)
    },
    {
        id: 'us_presidents',
        name: 'US Presidents',
        icon: <User />,
        imageMap: usPresidentsImageMap,
        deckData: USPresidents,
        instruction: "Which President Served First?",
        comparisonType: "date",
        blogData: {
            title: "List of US Presidents",
            description: `Discover a comprehensive list of all U.S. Presidents, 
            from the founding of the nation to the present day. This blog provides 
            detailed insights into the leadership, policies, and legacies of each 
            president, highlighting key moments in American history. Whether you're 
            a history enthusiast or simply curious about the individuals who have shaped 
            the U.S., this resource offers a valuable overview of the nation's political evolution.`,
            date: "January 2, 2025",
        }
    },
] as DisplayDecks[];