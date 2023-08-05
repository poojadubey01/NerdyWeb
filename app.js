const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const natural = require('natural');

const app = express();
const port = 3000;

// Middleware to parse incoming JSON data
app.use(bodyParser.json());

// Enable CORS for all routes
app.use(cors());

const dataPath = path.join(__dirname, 'data', 'courses.json');

// Helper function to read course data from the JSON file
function readCourses() {
  const rawData = fs.readFileSync(dataPath);
  return JSON.parse(rawData);
}

// Define the API Endpoints

// Root endpoint to provide some information about the API
app.get('/', (req, res) => {
  res.send("The Course API is your gateway to a treasure trove of learning opportunities. It provides a RESTful interface to fetch essential information about various online courses. Dive in and explore the captivating world of knowledge!");
});

// Endpoint to get all courses, filter courses by field, or search for courses
app.get('/courses', async (req, res) => {
  const courses = readCourses();
  const { field, search, sortBy, sortOrder } = req.query;

  // Search and filter courses based on field or search term
  let filteredCourses = courses;
  if (field) {
    filteredCourses = courses.filter(course => course.field.toLowerCase() === field.toLowerCase());
  } else if (search) {
    const tokenizer = new natural.WordTokenizer();
    const searchTermTokens = tokenizer.tokenize(search.toLowerCase());

    filteredCourses = courses.filter(course => {
      const titleTokens = tokenizer.tokenize(course.title.toLowerCase());
      const instructorTokens = tokenizer.tokenize(course.instructor.toLowerCase());

      return searchTermTokens.some(token => titleTokens.includes(token) || instructorTokens.includes(token));
    });
  }

  // Sorting the courses based on the sortField and sortOrder
  const sortField = sortBy || "id";
  const sortOrderValue = sortOrder === "desc" ? -1 : 1;

  filteredCourses.sort((a, b) => {
    const aValue = a[sortField]?.toString().toLowerCase();
    const bValue = b[sortField]?.toString().toLowerCase();
    return aValue.localeCompare(bValue) * sortOrderValue;
  });

  res.json(filteredCourses);
});

// Start the server
app.listen(port, () => {
  console.log(`Course API listening at http://localhost:${port}`);
});
