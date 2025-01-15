import { DECK_NAMES, DISPLAY_DECKS } from '~/utils/deckCollection';
import { areSetsEqual, setSubtract } from '~/utils/utils';

import { Events, ImageMap } from '../utils/types';

// Get deck by name and perform validation
export const getDeck = (deckName: DECK_NAMES): Events => {
  console.log("Getting deck", deckName);
  const deck = DISPLAY_DECKS.find((deck) => deck.id === deckName)!;
  let imageMap = deck.imageMap;
  let deckData = deck.deckData;

  // Clone the data so we can mutate it
  deckData = JSON.parse(JSON.stringify(deckData)) as Events;

  if (imageMap) {
    imageMap = JSON.parse(JSON.stringify(imageMap)) as ImageMap;
    // Validate that all cards have images and all images have cards
    const allImages = new Set(Object.keys(imageMap));
    const allCards = new Set(deckData.map((card) => card.id));
    if (!areSetsEqual(allImages, allCards)) {
      const extraImages = setSubtract(allImages, allCards);
      const extraCards = setSubtract(allCards, allImages);
      let message = "Message: ";
      if (extraImages.size > 0) {
        message += "Extra Images:" + JSON.stringify(extraImages);
      }
      if (extraCards.size > 0) {
        message += "Extra Cards:" + JSON.stringify(extraCards);
      }
      throw new Error("Image and Card Mismatch! " + message);
    }
  }

  // Assign the image into the cards
  for (const card of deckData) {
    if (imageMap) {
      // Unsafe assignment of an error typed value.
      // eslint-disable-next-line
      card.image = imageMap[card.id];
    } else if (card.imageURL) {
      card.image = card.imageURL;
    }

    // Assign rank value based on key
    if (deck.rankKey) {
      const value = card[deck.rankKey];
      if (value == undefined) {
        throw new Error("Invalid rank key! " + deck.rankKey);
      }
      card.rank = card[deck.rankKey];
    }
  }

  return deckData;
};
