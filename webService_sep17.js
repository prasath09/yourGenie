const express = require('express');
const app = express();
const port = 3000;
const mysql = require('mysql2');
const axios = require('axios');

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Create a connection to the MySQL database
const connection = mysql.createConnection({
    host: 'apitestdb.cj8eoeeosxkn.ap-southeast-1.rds.amazonaws.com', // Replace with your RDS endpoint
    user: 'admin',     // Replace with your RDS username
    password: 'apitestdb', // Replace with your RDS password
    database: 'apitestdb' // Replace with your database name
});

// Connect to the database
connection.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return;
    }
    console.log('Connected to the database!');
});


// Middleware to parse incoming request bodies as JSON
app.use(express.json());

app.post('/getVendors', async (req, res) => {
    if(req.body.business != null){
      const business = req.body.business;  // Example condition
      const query = 'SELECT * FROM vendors WHERE business = ?';

      // Execute the query
      connection.execute(query, [business], async (err, results) => {
        if (err) {
          console.error('Error executing query:', err);
          return;
        }

        // Send the updated results as response
        res.status(200).json({
          status: 'success',
          data: {
            vendorList: results,
            clientData: req.body,  // Add the request data here
          },
        });
      });
    }
});

app.post('/getVendorResponse', async (req, res) => { 
    if(req.body.acknowledge === "yes"){ 
        const API_KEY = 'AIzaSyBYuKtqLfVYcwdMPSP7Uq8tPUR0gPBLe1A';
        const origin = { lat: req.body.data.clientData.latitude, lng: req.body.data.clientData.longitude };
        const destination = { lat: req.body.data.vendorData.latitude, lng: req.body.data.vendorData.longitude };
    
        // Function to get the distance between two coordinates
        async function getDistanceBetweenCoordinates() {
            const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&key=${API_KEY}`;
            try {
              const response = await axios.get(url);
              if (response.data.status === 'OK') {
                const element = response.data.rows[0].elements[0];
                const distance = element.distance.text;
                return distance;
              } else {
                console.error('Error:', response.data.error_message);
                return null;
              }
            } catch (error) {
              console.error('Error making request:', error);
              return null;
            }
          }
          // Await the distance calculation
          const distance = await getDistanceBetweenCoordinates();
          console.log('distance', distance);

        // Send the updated results as response
        res.status(200).json({
            status: 'success',
            data: {
                vendorData: req.body.data.vendorData,
              requestData: req.body.data.clientData, 
              distance:distance // Add the request data here
            },
          });
    }
});



