import axios from 'axios';
import React, { useState, useEffect } from 'react';
import config from '../config';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const useTemplateApi = (force) => {
    const [data, setData] = useState([]);
    const [forceFetch, setforceFetch] = useState(force || false)
    const [loading, setLoading] = useState(true);
    const accessToken = Cookies.get('accessToken');
    const userid = jwtDecode(accessToken).user_id;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken,
    };

    useEffect(() => {
        const fetchData = async () => {
            const storedData = localStorage.getItem('templateData');
            const lastFetchTime = localStorage.getItem('lastFetchTime');

            if (!forceFetch && (storedData && lastFetchTime) && (Date.now() - parseInt(lastFetchTime)) < 3600000) {
                setData(JSON.parse(storedData));
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${config.baseUrl}get_templates/?user_id=${userid}`, { headers });

                if (JSON.stringify(response.data)) {
                    localStorage.setItem('templateData', JSON.stringify(response.data));
                    localStorage.setItem('lastFetchTime', Date.now().toString());
                    setData(response.data);
                    setforceFetch(false)
                }

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [forceFetch, userid]);

    return { data, loading };
};

export default useTemplateApi;
