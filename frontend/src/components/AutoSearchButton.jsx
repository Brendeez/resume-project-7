import { Link } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

const AutoSearchButton = ({ destination = '/autoSearch' }) => {
  return (
    <div className='tw-flex'>
      <Link
        to={destination}
        className='tw-bg-sky-800 hover:tw-bg-orange-500 tw-text-white tw-px-4 tw-py-1 tw-rounded-lg tw-w-fit'
      >
        <h1 className='tw-flex tw-items-center tw-justify-center'> Automatic Selection    
        <FaSearch className='tw-text-2xl' />
        </h1>
      </Link>
    </div>
  );
};

export default AutoSearchButton;