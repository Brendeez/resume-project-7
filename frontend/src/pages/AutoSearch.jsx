import React, { useEffect, useState } from 'react';
import BB from '../components/BackButton';
import SearchBar from '../components/searchBar';

const AutoSearch = () => {


  return (
    <div>
      <div className="tw-bg-orange-200 ">
        <BB />
        <div className="tw-h-8 tw-flex tw-items-center tw-justify-center">
          <h1 className="tw-text-2xl tw-font-bold tw-py-2 tw-px-4 tw-rounded tw-mb-4">AUTOMATIC SEARCH SECTION</h1>
        </div>
      </div>
        <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-screen tw-bg-red-100">

          <div>
          <SearchBar />
          </div>
          
          
        </div>
      </div>     
    
  );
};

export default AutoSearch;
