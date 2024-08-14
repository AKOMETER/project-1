import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const CookieConsent = () => {
    const [acceptedCookies, setAcceptedCookies] = useState(Cookies.get('cookieConsent') === 'accepted');

    const handleAcceptCookies = () => {
        Cookies.set('cookieConsent', 'accepted', { expires: 365, path: '/' });
        setAcceptedCookies(true);
    };

    useEffect(() => {
    }, []);

    if (acceptedCookies) {
        return null;
    }

    return (
        <div className="cookie-consent absolute bottom-0 bg-white">
            <p>This website uses cookies. By continuing to use this site, you accept our use of cookies.</p>
            <button onClick={handleAcceptCookies}>Accept Cookies</button>
        </div>
    );
};

export default CookieConsent;
