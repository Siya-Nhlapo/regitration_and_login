// Importing necessary libraries and modules
const mongoose = require('mongoose');            // MongoDB ODM library
const Customers = require('./customer');         // Imported MongoDB model for 'customers'
const express = require('express');              // Express.js web framework
const session = require('express-session');      // Middleware for managing user sessions
const { randomUUID } = require('crypto');         // Node.js built-in UUID generator
const bodyParser = require('body-parser');       // Middleware for parsing JSON requests
const { ValidationError, InvalidUserError, AuthenticationFailed } = require('./errors/CustomError'); // Custom error classes for handling specific error scenarios
const path = require('path');                    // Node.js path module for working with file and directory paths
const dotenv = require('dotenv');                // Module for loading environment variables from a .env file
// Importing the 'bcrypt' library for hashing passwords.
const bcrypt = require('bcrypt');
// Defining the number of salt rounds for bcrypt hashing. This determines the complexity of the hashing process.
const saltRounds = 5;

// Defining a constant password for demonstration purposes. In a real application, passwords should be securely hashed and stored.
const password = "admin";              

dotenv.config();

// Creating an instance of the Express application
const app = express();

app.use(session({
    cookie: { maxAge: 120000 }, // Session expires after 2 minutes of inactivity
    secret: 'itsmysecret', // Secret key for signing the session ID cookie
    resave: false, // Forces the session to be saved back to the session store, even if it was never modified during the request
    saveUninitialized: true, // Forces a session that is "uninitialized" to be saved to the store. A session is uninitialized when it is new but not modified
    genid: () => randomUUID() // Generates a unique session ID synchronously
}));

// Setting the port number for the server
const port = 3001;

// MongoDB connection URI and database name
const uri = process.env.MONGODB_URI_TEST;

if (!uri) {
    console.error('MONGODB_URI is missing. Set it in your .env file before starting the app.');
} else {
    mongoose.connect(uri, { dbName: 'customerDB' })
        .then(() => console.log('Connected to MongoDB Atlas successfully.'))
        .catch((err) => {
            console.error('MongoDB connection failed:', err.message);
        });
}

// Middleware to parse JSON requests
app.use("*", bodyParser.json());

// Serving static files from the 'frontend' directory under the '/static' route
app.use('/static', express.static(path.join(".", 'frontend')));

// Middleware to handle URL-encoded form data
app.use(bodyParser.urlencoded({ extended: true }));

// POST endpoint for user login
app.post('/api/login', async (req, res, next) => {
    const data = req.body;
    const user_name = data['user_name'];
    const password = data['password'];

    try {
        // Querying the MongoDB 'customers' collection for matching user_name
        const user = await Customers.find({ user_name: user_name });
        if (!user) {
            throw new InvalidUserError("No such user in database");
        }
        if (user.password !== password) {
            throw new AuthenticationFailed("Password does not match");
        }

        // If a matching user is found, set the session username and serve the home page
        if (user.length > 0) {
            let result = await bcrypt.compare(password, user[0]['password']);
            if(true) {
                const genidValue = req.sessionID; // Storing the session ID in a variable for potential use
                req.session.username = user_name; // Storing the username in the session for later use
                res.cookie('username', user_name); // Setting a cookie with the username for client-side access
                res.sendFile(path.join(__dirname, 'frontend', 'home.html')); // Serving the home page to the client
            } else {
                res.send("Password Incorrect! Try again");
            } 
        } else {
            res.send("User Information incorrect");
        }

        res.send("User Logged In Successfully");

    } catch (error) {
        next(error); // Passing the error to the next middleware for centralized error handling
    }
});

// POST endpoint for adding a new customer
app.post('/api/register', async (req, res, next) => {
    const data = req.body;
    const age = parseInt(data['age']); // Parsing the age from the request body to an integer

    try {
        if(age < 21) {
            throw new ValidationError("Customer Under required age limit");
        }
    
        console.log(data)
        const documents = await Customers.find({ user_name: data['user_name']});
        if (documents.length > 0) {
            res.send("User already exists");
        }

        // Hashing the password using bcrypt before saving it to the database
        let hashedpwd = bcrypt.hashSync(data['password'], saltRounds);
        
        // Creating a new instance of the Customers model with data from the request
        const customer = new Customers({
            "user_name": data['user_name'],
            "age": data['age'],
            "password": hashedpwd,
            "email": data['email']
        });

        // Saving the new customer to the MongoDB 'customers' collection
        await customer.save();

        res.send("Customer added successfully")
    }
    catch (error) {
        next(error);
    }
});

// GET endpoint for the root URL, serving the home page
app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'home.html'));
});

// GET endpoint for the user logout
app.get('/api/logout', async (req, res) => {
    req.session.destroy((err) => {
        if (err) { // Handling any errors that occur during session destruction
            console.error(err);
        } else {
            res.cookie('username', '', { expires: new Date(0) }); // Clearing the username cookie by setting its expiration date to a past date
            res.redirect('/'); // Redirecting the user to the home page after logout
        }
    });
})

// Add global error handler
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "Error";
    console.log(err.stack);
    res.status(err.statusCode).json({
        status: err.statusCode,
        message: err.message,
    });
})

app.all("*", (req, res, next) => {
    const err = new Error(`Cannot find the URL ${req.originalUrl} in this application. Please check.`);
    err.status = "Endpoint Failure";
    err.statusCode = 404;
    next(err);
})

// Starting the server and listening on the specified port
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

