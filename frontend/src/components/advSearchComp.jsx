import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { fetchConfig } from '../fetchConfig';

const API_URL = 'https://api.unsplash.com/search/photos';
const IMAGES_PER_PAGE = 20;

function advSearchComp() {
  const searchInput = useRef(null);

  // State variables to manage data and UI
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBasket, setShowBasket] = useState(false); 
  const [selectedImages, setSelectedImages] = useState([]);

  const addToBasket = (image) => {
    setSelectedImages([...selectedImages, image]);
  }; 

  const clearBasket = () => {
    setSelectedImages([]);
  };

  const removeFromBasket = (image) => {
    const updatedBasket = selectedImages.filter((selectedImage) => selectedImage.id !== image.id);
    setSelectedImages(updatedBasket);
  }; 

  const handleDownload = () => {
    async function fetchImageCompression() {
      const backendURL = await fetchConfig();
      console.log(searchInput.current.value);
      console.log(selectedImages);
      try {
        const response = await fetch(`${backendURL}/api/getImages`, {
          method: 'POST',
          headers: { 'Content-type': 'application/json' },
          body: JSON.stringify({ query: searchInput.current.value, userSelectedImages: selectedImages}),
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

    fetchImageCompression();
  }

  function Basket({ selectedImages, removeFromBasket }) {
    return (
      <div className='tw-pt-4 tw-bg-stone-200'>

        <div className="tw-flex  tw-bg-green-500 tw-items-center tw-justify-center">
        <h2 className='tw-text-2xl tw-font-bold tw-py-2 tw-px-4 tw-rounded mb-4'>Basket</h2>
        </div>

        <div className='tw-flex tw-flex-wrap'>
          {selectedImages.map((image) => (
            <div key={image.id} className='col-4 mb-3'>
              <div className='card'>
                <img
                  src={image.urls.thumb}
                  alt={image.alt_description}
                  className='card-img-top img-thumbnail'
                />
                <div className='card-body'>
                  <button
                    onClick={() => removeFromBasket(image)}
                    className="tw-bg-red-100 tw-py-2 tw-px-4 tw-rounded mb-4 "
                  >
                    Remove from Basket
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className='tw-flex tw-justify-center tw-items-center tw-gap-[var(--default-margin)] tw-mt-[var(--medium-margin)] tw-mb-[var(--larger-margin)]'>
          <button onClick={handleDownload} className='tw-text-2xl tw-bg-blue-500 tw-font-bold tw-py-2 tw-px-4 tw-rounded mb-4'>Download</button>
          <button onClick={clearBasket} className='tw-text-2xl tw-bg-red-500 tw-font-bold tw-py-2 tw-px-4 tw-rounded mb-4'>Clear Basket</button>
        </div>
      </div>
      
    );
  } 

  const fetchImages = useCallback(async () => {
    try {
      if (searchInput.current.value) {
        setErrorMsg('');
        setLoading(true);
        const { data } = await axios.get(
          `${API_URL}?query=${searchInput.current.value
          }&page=${page}&per_page=${IMAGES_PER_PAGE}&client_id=Wib1GA3dwGV1INQVleWMBGpd4WX9S7Uxq9-yhzal3t0
          `
        );
        //${import.meta.env.VITE_API_KEY)
        setImages(data.results);
        setTotalPages(data.total_pages);
        setLoading(false);
      }
    } catch (error) {
      setErrorMsg('Error fetching images. Try again later.');
      console.log(error);
      setLoading(false);
    }
  }, [page]);

  // Fetch images when the component mounts or when there's a search query change
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const resetSearch = () => {
    setPage(1);
    fetchImages();
  };
  // Function to handle search form submission
  const handleSearch = (event) => {
    event.preventDefault();
    resetSearch();
  };
  // Function to handle selecting a search suggestion
  const handleSelection = (selection) => {
    searchInput.current.value = selection;
    resetSearch();
  };

  return (
    <div className='container'>
      {errorMsg && <p className='error-msg'>{errorMsg}</p>}
      <div className='search-section'>
        <Form onSubmit={handleSearch}>
          <Form.Control
            type='search'
            placeholder='Type something to search...'
            className='search-input'
            ref={searchInput}
          />
        </Form>
      </div>
      <div className='filters'>
        <div onClick={() => handleSelection('mountain')}>Example</div>
        <Button onClick={() => setShowBasket(!showBasket)}>
          {showBasket ? 'Close Basket' : 'View Basket'}
        </Button>
      </div>
      {showBasket && (
        <Basket selectedImages={selectedImages} removeFromBasket={removeFromBasket} />
      )}
      {loading ? (
        <p className='loading'>Loading...</p>
      ) : (
        <>
          <div>
            <div className='images'>
              {images.map((image) => (
                <div key={image.id} className='image-container'>
                  <img
                    src={image.urls.small}
                    alt={image.alt_description}
                    className='image'
                  />
                  {selectedImages.find((selectedImage) => selectedImage.id === image.id) ? (
                    <Button className="tw-bg-red-100 tw-py-2 tw-px-4 tw-rounded mb-4  tw-float-right" onClick={() => removeFromBasket(image)} variant='danger'>
                      Remove from Basket
                    </Button>
                  ) : (
                    <Button className="tw-bg-green-100 tw-py-2 tw-px-4 tw-rounded mb-4 tw-float-right" onClick={() => addToBasket(image)} variant='success'>
                      Add to Basket
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className='tw-flex tw-justify-center tw-items-center tw-gap-[var(--default-margin)] tw-mt-[var(--medium-margin)] tw-mb-[var(--larger-margin)]'>
              {page > 1 && (
                <Button className="tw-bg-red-100 tw-py-2 tw-px-4 tw-rounded mb-4" onClick={() => setPage(page - 1)}>Previous</Button>
              )}
              {page < totalPages && (
                <Button className="tw-bg-green-100 tw-py-2 tw-px-4 tw-rounded mb-4" onClick={() => setPage(page + 1)}>Next</Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default advSearchComp;
