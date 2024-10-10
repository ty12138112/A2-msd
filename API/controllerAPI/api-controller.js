// Import the database connection module
var dbcon = require("../crowdfunding_db");

// Get a database connection object
var connection = dbcon.getconnection();

// Establish a connection to the database
connection.connect();

// Import the Express framework
var express = require('express');

// Create a new router object to handle routes
var router = express.Router();

// Define a route to get all active fundraisers
router.get("/FUNDRAISER", (req, res) => {
    // SQL query to select all active fundraisers and their categories
    connection.query(`SELECT f.*, c.NAME as category_name 
    FROM FUNDRAISER f
    JOIN CATEGORY c ON f.CATEGORY_ID = c.CATEGORY_ID
    WHERE f.active = 1;`, (err, records, fields) => {
        if (err) {
            // Log an error if the query fails
            console.error("Error while retrieve the data");
        } else {
            // Send the query results back to the client
            res.send(records);
        }
    })
})

// Define a route to get all categories
router.get("/CATEGORY", (req, res) => {
    // SQL query to select all categories
    connection.query("select * from CATEGORY", (err, records, fields) => {
        if (err) {
            // Log an error if the query fails
            console.error("Error while retrieve the data");
        } else {
            // Send the query results back to the client
            res.send(records);
        }
    })
})

// Define a route for searching fundraisers
router.get('/search', (req, res) => {
    // Extract search parameters from the query string
    const { ORGANIZER, CITY, CATEGORY } = req.query;

    // SQL query with placeholders for search parameters
    const query = `
      SELECT f.*, c.NAME as category_name 
      FROM FUNDRAISER f
      JOIN CATEGORY c ON f.CATEGORY_ID = c.CATEGORY_ID
      WHERE f.ACTIVE = 1
      AND (? IS NULL OR f.ORGANIZER LIKE ?)
      AND (? IS NULL OR f.CITY LIKE ?)
      AND (? IS NULL OR c.NAME LIKE ?)
    `;

    // Array of values to replace placeholders in the query
    const values = [
        ORGANIZER, `%${ORGANIZER}%`,
        CITY, `%${CITY}%`,
        CATEGORY, `%${CATEGORY}%`
    ];

    // Execute the query with the provided values
    connection.query(query, values, (err, records) => {
        if (err) {
            // Log an error if the query fails
            console.error("Error while retrieving the data:");
        }
        // Send the query results back to the client as JSON
        res.json(records);
    });
});

// Define a route to get a specific fundraiser by ID
// router.get('/FUNDRAISER/:id', (req, res) => {
//     // Extract the fundraiser ID from the URL parameters
//     const fundraiserId = req.params.id;

//     // SQL query to select a specific fundraiser and its category
//     const query = `
//       SELECT f.*, c.NAME as category_name 
//       FROM FUNDRAISER f
//       JOIN CATEGORY c ON f.CATEGORY_ID = c.CATEGORY_ID
//       WHERE f.FUNDRAISER_ID = ?
//     `;

//     // Execute the query with the fundraiser ID
//     connection.query(query, [fundraiserId], (err, records) => {
//         if (err) {
//             // Log an error if the query fails
//             console.error("Error while retrieving the data:");
//         }
//         // Send the query results back to the client as JSON
//         res.json(records);
//     });
// });

router.get('/fundraiser/:id', (req, res) => {
    const fundraiserId = req.params.id;
    const query = `
      SELECT f.*, c.NAME as category_name, d.DONATION_ID, d.AMOUNT, d.GIVER
      FROM FUNDRAISER f
      JOIN CATEGORY c ON f.CATEGORY_ID = c.CATEGORY_ID
      LEFT JOIN DONATION d ON f.FUNDRAISER_ID = d.FUNDRAISER_ID
      WHERE f.FUNDRAISER_ID = ?
    `;
    connection.query(query, [fundraiserId], (err, records) => {
        if (err) {
            // Log an error if the query fails
            console.error("Error while retrieving the data");
        }
        // Send the query results back to the client as JSON
        res.json(records);
    });
});

// Insert a new donation
router.post('/donation', (req, res) => {
    const { DATE, AMOUNT, GIVER, FUNDRAISER_ID } = req.body;
    const query = `
      INSERT INTO DONATION (DATE, AMOUNT, GIVER, FUNDRAISER_ID)
      VALUES (?, ?, ?, ?)
    `;
    connection.query(query, [DATE, AMOUNT, GIVER, FUNDRAISER_ID], (err, result) => {
        if (err) {
            console.error("Error while inserting the donation: " + err);
        } else {
            res.send({ insert: "success" });
        }
    });
});

router.post('/fundraiser', (req, res) => {
    const { ORGANIZER, CAPTION, TARGET_FUNDING, CURRENT_FUNDING, CITY, ACTIVE, CATEGORY_ID } = req.body;
    const query = `
      INSERT INTO FUNDRAISER (ORGANIZER, CAPTION, TARGET_FUNDING, CURRENT_FUNDING, CITY, ACTIVE, CATEGORY_ID)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    connection.query(query, [ORGANIZER, CAPTION, TARGET_FUNDING, CURRENT_FUNDING, CITY, ACTIVE, CATEGORY_ID], (err, result) => {
        if (err) {
            console.error("Error while inserting the donation: " + err);
        } else {
            res.send({ insert: "success" });
        }
    });
});


router.put('/updateFundraiser/:id', (req, res) => {
    const fundraiserId = req.params.id;
    const { ORGANIZER, CAPTION, TARGET_FUNDING, CURRENT_FUNDING, CITY, ACTIVE, CATEGORY_ID } = req.body;
    const query = `
          UPDATE FUNDRAISER
          SET ORGANIZER = ?, CAPTION = ?, TARGET_FUNDING = ?, CURRENT_FUNDING = ?, CITY = ?, ACTIVE = ?, CATEGORY_ID = ?
          WHERE FUNDRAISER_ID = ?
        `;
    connection.query(query, [ORGANIZER, CAPTION, TARGET_FUNDING, CURRENT_FUNDING, CITY, ACTIVE, CATEGORY_ID, fundraiserId], (err, result) => {
        if (err) {
            console.error("Error while Updating the data" + err);
        } else {
            res.send({ update: "success" });
        }
    })
})

router.delete("/delete/:id", (req, res) => {
    connection.query("delete from FUNDRAISER where FUNDRAISER_ID=" + req.params.id, (err, records, fields) => {
        if (err) {
            console.error("Error while deleting the data");
        } else {
            res.send({ delete: "Delete Sucess" });
        }
    })
})

// Export the router so it can be used in other parts of the application
module.exports = router;
