import React from 'react';
import AdvancedSearchButton from '../components/AdvancedSearchButton';
import AutoSearchButton from '../components/AutoSearchButton';
const Home = () => {

  return (
    <div class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-screen">
      <h1 className="tw-text-2xl tw-font-bold tw-py-2 tw-px-4 tw-rounded tw-mb-4">Unsplash Image Finder</h1>
      
          <div className="tw-mb-4 tw-transition-opacity tw-duration-300 tw-ease-in-out tw-transform hover:tw-scale-150"> <AdvancedSearchButton /></div>
          <div className="tw-mb-4 tw-transition-opacity tw-duration-300 tw-ease-in-out tw-transform hover:tw-scale-150"> <AutoSearchButton /></div>
        
      </div>
  );
};

export default Home;
