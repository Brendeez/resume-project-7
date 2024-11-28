// Required modules
const express = require('express');
const cors = require('cors');
const archiver = require('archiver'); // Compression library
const cheerio = require('cheerio'); // Image Scraping Library
const Redis = require('ioredis');
const AWS = require('aws-sdk');

require('dotenv').config();

// S3 setup
const bucketName = "tooloo-image-store";
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

(async () => {
  try {
    await s3.createBucket({ Bucket: bucketName }).promise();
    console.log(`Created bucket: ${bucketName}`);
  } catch (err) {
    // We will ignore 409 errors which indicate that the bucket already
    console.log("Bucket exists yippeee");

    if (err.statusCode !== 409) {
      console.log(`Error creating bucket: ${err}`);
    }
  }
})();

// This section will change for Cloud Services 
// Redis setup

const redisClient = new Redis();

// Create an Express app
const app = express();

app.use(cors());
app.use(express.json());

// Function to scrape images from a given URL and create a zip file
async function scrapeImages(url) {
  try {
    // Fetch HTML content from the provided URL
    const response = await fetch(url);
    const body = await response.text();
    const $ = cheerio.load(body);

    // Create a memory stream for the zip file
    const archive = archiver('zip', {
      zlib: { level: 9 } // Set compression level
    });
    const buffers = [];

    // Event handlers for the zip creation process
    archive.on('data', function (buffer) {
      buffers.push(buffer);
    });

    archive.on('end', function () {
      console.log('archiver has been finalized.');
    });

    const imageUrls = [];

    // Extract image URLs from 'img' elements in the HTML
    $('img').each((index, element) => {
      const imageUrl = $(element).attr('src');
      if (imageUrl) {
        imageUrls.push(imageUrl);
      }
    });

    // Function to fetch image data from a given URL
    async function getImage() {
      const response = await fetch(imageUrls[j]);
      const imageData = await response.arrayBuffer();
      const buffer = Buffer.from(imageData);

      if (buffer.length < 5000) {
        // Check if file size is too small to be a proper image, then fetch again if small
        j++;
        return await getImage();
      }
      i++; j++;
      return buffer;
    }

    var i = 0; var j = 0;

    while (i < 10) {
      archive.append(await getImage(), { name: `image${i}.jpeg` });
    }

    await archive.finalize(); // Finalize the zip creation

    // Combine buffers into a single buffer
    const resultBuffer = Buffer.concat(buffers);

    return resultBuffer;
  } catch (error) {
    console.error('Error:', error);
  }
}

async function scrapeImagesCustom(url) {
  try {
    // Create a memory stream for the zip file
    const archive = archiver('zip', {
      zlib: { level: 9 } // Set compression level
    });
    const buffers = [];

    // Event handlers for the zip creation process
    archive.on('data', function (buffer) {
      buffers.push(buffer);
    });

    archive.on('end', function () {
      console.log('archiver has been finalized.');
    });


    for (var i = 0; i < url.length; i++) {
      console.log(url[i].urls.raw);
      let response = await fetch(url[i].urls.raw);
      let imageData = await response.arrayBuffer();
      archive.append(Buffer.from(imageData), { name: `image${i}.jpeg` }); // Fetch image and add it to the compressor as a buffer
    }

    await archive.finalize(); // Finalize the zip creation

    // Combine buffers into a single buffer
    const resultBuffer = Buffer.concat(buffers);

    return resultBuffer;
  } catch (error) { console.log(error); }

}


app.post('/api/getImages', async (req, res) => {
  const query = req.body.query;
  const userSelectedImagesURLs = req.body.userSelectedImages;

  const urlToScrape = `https://unsplash.com/s/photos/${query}`;

  const redisKey = `image:${query}`;
  const s3Key = `image-${query}`;

  // Check if results in Redis
  const redisResult = await redisClient.getBuffer(redisKey);
  console.log("Get Images Request Called");

  if (redisResult) {

    // If found, send it to the user
    console.log(redisResult);
    console.log('Result retrieved from  Redis');

    res.setHeader('Content-type', 'application/zip');
    res.send(redisResult);
    return;
  }

  // Redis result not found, try and find in S3, upload to Redis and return response if found
  else {

    console.log("Result not found in Redis, continuing");

    try {
      const params = { Bucket: bucketName, Key: s3Key };

      const s3Result = await s3.getObject(params).promise();
      const s3ResultBody = s3Result.Body;
      console.log(s3ResultBody);
      console.log('Result retrieved from  S3');

      // Store Key-Value pair in Redis
      redisClient.set(
        redisKey,
        s3ResultBody,
        "EX",
        3600
      )

      console.log(`Successfully uploaded to redis`);

      res.setHeader('Content-type', 'application/zip');
      res.send(s3ResultBody);
      return;

      // S3 Result is not found
    } catch (error) {
      if (error.statusCode === 404) {
        console.log("S3 key not found, fetching now");


        // Retrieve Images from URL

        var imageResponse;
        if (!(userSelectedImagesURLs)) {
          imageResponse = await scrapeImages(urlToScrape);
        }

        else {
          imageResponse = await scrapeImagesCustom(userSelectedImagesURLs);
        }
        const objectParams = { Bucket: bucketName, Key: s3Key, Body: imageResponse };

        // Upload images to S3
        await s3.putObject(objectParams).promise();

        console.log(`Successfully uploaded data to ${bucketName}${s3Key}`);

        // Upload images to Redis
        redisClient.set(
          redisKey,
          imageResponse,
          "EX",
          3600
        )

        console.log(`Successfully uploaded to redis`);
        console.log('Result retrieved from the internet');

        // Return images to user
        res.setHeader('Content-type', 'application/zip');
        res.send(imageResponse);
        return;
      }
      else {
        res.send('Error accessing S3');
        return;
      }
    }
  }

});

// Start the server on port 3001
app.listen(3001, () => {
  console.log(`Server listening on port 3001`);
});