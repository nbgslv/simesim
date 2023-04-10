import React, { useEffect } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { Spinner } from 'react-bootstrap';
import MainLayout from '../../../../components/Layouts/MainLayout';
import ClientOnly from '../../../../components/ClientOnly/ClientOnly';

const Post = () => {
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const { planId } = router.query;

  useEffect(() => {
    if (planId) {
      setLoading(false);
    }
  }, [planId]);

  return (
    <MainLayout title="משוב" hideJumbotron>
      <Script src="https://tally.so/widgets/embed.js" />
      <ClientOnly>
        <div className="container">
          {loading && <Spinner animation="border" role="status" />}
          <iframe
            data-tally-src="https://tally.so/embed/wAzGkl?alignLeft=1&transparentBackground=1&dynamicHeight=1"
            loading="lazy"
            width="100%"
            height="388"
            frameBorder="0"
            // @ts-ignore
            marginHeight="0"
            // @ts-ignore
            marginWidth="0"
            title="איך הייתה החווייה שלך עם שים eSim?"
          ></iframe>
        </div>
      </ClientOnly>
    </MainLayout>
  );
};

export default Post;
