import { Brain, Earth, EarthLock, Ruler, Swords, User, UsersRound } from 'lucide-react';
import LeagueData from '~/data/league.json';
import NFLPassYards from '~/data/nfl_pass_yards.json';
import OldWorldHistoryData from '~/data/old_world_history.json';
import PhilosophersData from '~/data/philosophers.json';
import RedditCommunitesData from '~/data/reddit_communities.json';
import USPresidents from '~/data/us_president_inaugurations.json';
import WorldHistoryData from '~/data/world_history.json';
import { IMAGE_MAP as leagueImageMap } from '~/generated/LeagueImages';
import { IMAGE_MAP as nflPassYardsImages } from '~/generated/NflPassYardsImages';
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
        blogData: {
            title: "Most Significant World History Events",
            description: `Explore the pivotal moments in world history that shaped 
            our present and continue to influence our future. From ancient civilizations 
            to modern times, this blog dives into the most significant events that altered 
            the course of nations, cultures, and humanity itself. Gain deeper insights into 
            the wars, discoveries, revolutions, and movements that have left a lasting legacy 
            on the world stage.`,
            date: "January 3, 2025",
        }
    },
    {
        id: 'philosophers',
        name: 'Philosophers',
        icon: <Brain />,
        imageMap: philosophersImageMap,
        deckData: PhilosophersData,
        instruction: "Which Philosopher Came First?",
        comparisonType: "date",
        blogData: {
            title: "Most Significant Philosophers of All Time",
            description: `Embark on a journey through the minds that shaped the world. Whether you're a curious beginner or a seasoned thinker,
            this blog brings philosophy to life, exploring how these timeless ideas continue to resonate in our ever-changing 
            world. Expand your mind—one thinker at a time.`,
            date: "January 1, 2025",
        }
    },
    {
        id: 'reddit_communities',
        name: 'Reddit Communities',
        icon: <UsersRound />,
        deckData: RedditCommunitesData,
        imageMap: redditCommunitiesImageMap,
        instruction: "Which Subreddit Has More Subscribers?",
        comparisonType: "count",
        blogData: {
            title: "Most Popular Subreddits of All Time",
            description: `Curious about what’s trending in the Reddit universe? This article dives into the platform’s 
            most popular subreddits, where millions of users gather to share ideas, memes, advice, and more. From niche 
            hobbies to global conversations, discover the communities shaping the pulse of Reddit. Whether you’re new to 
            the platform or looking to expand your feed, this list will connect you with the vibrant corners of the internet 
            where the action happens. Explore, engage, and join the conversation!`,
            date: "January 1, 2025",
        }
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
            title: "The Presidents of the United States Timeline",
            description: `Discover a comprehensive list of all U.S. Presidents, 
            from the founding of the nation to the present day. This blog provides 
            detailed insights into the leadership, policies, and legacies of each 
            president, highlighting key moments in American history. Whether you're 
            a history enthusiast or simply curious about the individuals who have shaped 
            the U.S., this resource offers a valuable overview of the nation's political evolution.`,
            date: "January 2, 2025",
        }
    },
    {
        id: 'nfl_pass_yards',
        name: 'NFL Passing Yards',
        icon: <Ruler />,
        imageMap: nflPassYardsImages,
        deckData: NFLPassYards,
        instruction: "Which Quarterback Holds The Record For The Most Passing Yards?",
        comparisonType: "count",
        blogData: {
            title: "NFL Passing Yards Career Leaders",
            description: `Dive into the storied history of the NFL’s greatest quarterbacks with our comprehensive list of 
            all-time passing yards leaders. From record-setting performances to unforgettable moments on the field, this 
            article celebrates the legends who have redefined the passing game. Explore their achievements, milestones, and 
            how they’ve shaped the game we love today. Whether you're a die-hard fan or just getting into football, this is 
            your ultimate guide to the most prolific passers in NFL history!`,
            date: "January 19, 2025",
        }
    },
] as DisplayDecks[];