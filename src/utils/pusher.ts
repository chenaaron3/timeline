import Pusher from 'pusher-js';

// Only instantiate one connection
let pusher: Pusher | null;

// Only establish a connection when requested
export const getPusherClient = () => {
  if (pusher == null) {
    pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
  }
  return pusher;
};
