import React from 'react';
import BB from '../components/BackButton';

import AdvSearchComp from '../components/advSearchComp';


const AdvancedSearch = () => {
  

  return (
    <div>
      <div className="tw-bg-green-200 ">
        <BB />
        <div className="tw-h-8 tw-flex tw-items-center tw-justify-center">
          <h1 className="tw-text-2xl tw-font-bold tw-py-2 tw-px-4 tw-rounded tw-mb-4">CUSTOM SEARCH SECTION</h1>
        </div>
      </div>
      <AdvSearchComp/>
      
    </div>
  );
};

export default AdvancedSearch;
