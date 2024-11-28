import React, { useState } from 'react';
import { fetchConfig } from '../fetchConfig';

const SearchBar = () => {
    const [query, setQuery] = useState('');

    async function fetchImageCompression() {
        const backendURL = await fetchConfig();
        console.log(query);
        try {
            const response = await fetch(`${backendURL}/api/getImages`, {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({query}),
            });
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'Images.zip';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleQuery = (e) => {
        setQuery(e.target.value);
    }

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            fetchImageCompression();
        }
    }

    return (
        <div>
            <input
                type="text"
                value={query}
                onChange={handleQuery}
                onKeyDown={handleKeyPress}
                placeholder='Type something to search...'
                className='tw-rounded tw-border tw-border-black tw-p-4 tw-min-w-[500px]'
            />
        </div>
    );
};

export default SearchBar;