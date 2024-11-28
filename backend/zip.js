// Required modules
const express = require('express');
const cors = require('cors');
const archiver = require('archiver'); // Compression library
const cheerio = require('cheerio'); // Image Scraping Library
const redis = require('redis');
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
const redisClient = redis.createClient();
(async () => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis sucessfully");
  } catch (err) {
    console.log(err);
  }
})();


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
      archive.append(await getImage(), { name: `test${i}.jpeg` });
    }

    await archive.finalize(); // Finalize the zip creation

    // Combine buffers into a single buffer
    const resultBuffer = Buffer.concat(buffers);

    return resultBuffer;
  } catch (error) {
    console.error('Error:', error);
  }
}

app.post('/api/getImages', async (req, res) => {
  const query = req.body.query;
  const urlToScrape = `https://unsplash.com/s/photos/${query}`;

  const redisKey = `image:${query}`;
  const s3Key = `image-${query}`;
  const redisResult = await redisClient.get(redis.commandOptions({ returnBuffers: true }), redisKey);
  console.log("Get Images Request Called");

  if (redisResult) {
    // Serve from redis
    console.log(redisResult);
    console.log('Result retrieved from  Redis');

    res.setHeader('Content-type', 'application/zip');
    res.send(redisResult);
    return;
  }
  else {
    
    console.log("Result not found in Redis, continuing");

    try {
      const params = { Bucket: bucketName, Key: s3Key };

      const s3Result = await s3.getObject(params).promise();
      const s3ResultBody = s3Result.Body;
      console.log(s3ResultBody);
      console.log('Result retrieved from  S3');

      redisClient.setEx(
        redisKey,
        3600,
        s3ResultBody
      )

      console.log(`Successfully uploaded to redis`);

      res.setHeader('Content-type', 'application/zip');
      res.send(s3ResultBody);
      return;

    } catch (error) {
      if (error.statusCode === 404) {
        console.log("S3 key not found, fetching now");

        const imageResponse = await scrapeImages(urlToScrape);
        const objectParams = { Bucket: bucketName, Key: s3Key, Body: imageResponse };

        await s3.putObject(objectParams).promise();

        console.log(`Successfully uploaded data to ${bucketName}${s3Key}`);

        redisClient.setEx(
          redisKey,
          3600,
          imageResponse
        )

        console.log(`Successfully uploaded to redis`);
        console.log('Result retrieved from the internet');

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

  /*
  try {
    const resultBuffer = await scrapeImages(urlToScrape);
    console.log(resultBuffer.length);

    res.setHeader('Content-type', 'application/zip');
    res.send(resultBuffer);

  } catch (error) {
    res.status(500).send('Error processing the request');
  }
  */

/*

app.get("/api/store", async (req, res) => {
  const key = req.query.key.trim();

  const searchUrl = `https://en.wikipedia.org/w/api.php?action=parse&format=json&section=0&page=${key}`;
  const s3Key = `image-${key}`;

  // Check S3
  const params = { Bucket: bucketName, Key: s3Key };

  try {

    const s3Result = await s3.getObject(params).promise();

    // Serve from S3
    const s3JSON = JSON.parse(s3Result.Body);
    res.json(s3JSON);

  } catch (err) {

    if (err.statusCode === 404) {
      // Serve from Wikipedia API and store in S3
      response = await axios.get(searchUrl);
      const responseJSON = response.data;
      const body = JSON.stringify({
        source: "S3 Bucket",
        ...responseJSON,
      });

      const objectParams = { Bucket: bucketName, Key: s3Key, Body: body };

      await s3.putObject(objectParams).promise();

      console.log(`Successfully uploaded data to ${bucketName}${s3Key}`);

      res.json({ source: "Wikipedia API", ...responseJSON });

    } else {
      // Something else went wrong when accessing S3
      res.json(err);
    }
  }
});

app.get("/api/search", async (req, res) => {
  const query = req.query.query.trim();

  // Construct the wiki URL and redis key (reduced font size for clarity)
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=parse&format=json&section=0&page=${query}`;
  const redisKey = `image:${query}`;

  const result = await redisClient.get(redisKey);

  if (result) {
    // Serve from redis
    const resultJSON = JSON.parse(result);
    res.json(resultJSON);


  } else {
    const s3Result = await axios.get(`http://localhost:3000/api/store?key=${query}`);
    res.json(s3Result.data);
    const response = await axios.get(searchUrl);
    const responseJSON = response.data;
    redisClient.setEx(
      redisKey,
      3600,
      JSON.stringify({ source: "Redis Cache", ...responseJSON })
    );
  }
});
*/

// Start the server on port 3001
app.listen(3001, () => {
  console.log(`Server listening on port 3001`);
});