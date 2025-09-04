import React, { useEffect } from 'react';

// This allows us to access the adsbygoogle property on the window object
declare global {
  interface Window {
    adsbygoogle: any;
  }
}

const AdSense: React.FC = () => {
  useEffect(() => {
    // This pushes an ad request to Google
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <div style={{ textAlign: 'center', margin: '20px 0' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-5701077439648731"
        data-ad-slot="8213675436"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdSense;