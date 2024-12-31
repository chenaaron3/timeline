import '~/styles/globals.css';

import { AppType } from 'next/app';
import { api } from '~/utils/api';

import { ClerkProvider } from '@clerk/nextjs';
import { GoogleAnalytics } from '@next/third-parties/google';

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider>
      <Component {...pageProps} />
      <GoogleAnalytics gaId="G-T2LR4YQ3RZ" />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
