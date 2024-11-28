import { Link } from 'react-router-dom';
import { BsArrowLeft } from 'react-icons/bs';

const BackButton = ({ destination = '/' }) => {
  return (
    <div className='tw-flex'>
      <Link
        to={destination}
        className='tw-bg-sky-800 hover:tw-bg-green-300 tw-text-white tw-px-4 tw-py-1 tw-rounded-lg tw-w-fit'
      >
        <BsArrowLeft className='tw-text-2xl' />
      </Link>
    </div>
  );
};

export default BackButton;
