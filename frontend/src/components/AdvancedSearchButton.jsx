import { Link } from 'react-router-dom';
import { FaSearchPlus } from 'react-icons/fa';

const AdvancedSearchButton = ({ destination = '/advancedSearch' }) => {
  return (
    <div className='tw-flex'>
      <Link
        to={destination}
        className='tw-bg-sky-800 hover:tw-bg-green-500 tw-text-white tw-px-4 tw-py-1 tw-rounded-lg tw-w-fit'
      >
        <h1 className='tw-flex tw-items-center tw-justify-center'> Custom Selection    
        <FaSearchPlus className='tw-text-2xl' />
        </h1>
      </Link>
    </div>
  );
};

export default AdvancedSearchButton;
