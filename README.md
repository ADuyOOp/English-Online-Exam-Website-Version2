# prac6-composev2 (change later)

Web-based Application for Online English Exam Practice

## Introduction

prac6-composev2 is a Node.js web application designed to help users practice and improve their English writing skills. The application includes several features:

- Grammar checking with the LanguageTool API
- Time indicator detection to identify verb tense mismatches
- Interactive text editing with real-time error highlighting
- Contextual suggestions for correcting errors
- User-friendly interface for writing practice
- Emmersive English testing environment

The application is built using Express.js for the backend, EJS for templating, and vanilla JavaScript for the frontend functionality.

## Prerequisites

Before setting up the project, make sure you have the following installed:

- Node.js (v16 or higher)
- npm (usually comes with Node.js, but you can install it separately)
- PostgreSQL (for database features)
- pgAdmin (for database management)

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/ADuyOOP/prac6-composev2
   cd prac6-composev2
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up PostgreSQL:
   - Install PostgreSQL from the [official website](https://www.postgresql.org/download/)
   - During installation, set a password for the PostgreSQL superuser (default user: `postgres`)
   - Start the PostgreSQL service using pgAdmin or the command line:
     ```bash
     sudo service postgresql start
     ```

4. Restore the database:
   - Ensure the `toiec.backup` file is accessible on your system
   - Create a new database named `toeic`:
     ```bash
     createdb -U postgres toeic
     ```
   - Restore the backup:
     ```bash
     pg_restore -U postgres -d toeic /path/to/toiec.backup
     ```
   - Verify the restore was successful:
     ```bash
     psql -U postgres -d toeic
     \dt
     ```

5. Configure database connection:
   - Ensure the database configuration in `Model/dbutil.js` matches your PostgreSQL setup:
     ```javascript
     var config = {
         user: 'postgres',
         password: '123456',  // Use your actual password
         host: 'localhost',
         port: 5432,
         database: 'toeic',
     };
     ```

6. Allocate data files:
   - Place the following data folders in the root of the `C:\` drive (disk C):
     - `Data`
     - `Exam`
     - `Ware`
   - **Warning:** The location of these data files is critical. The application will not work correctly if the files are not in the specified location.

## How to Run

1. Start the application:
   ```
   npm start
   ```
   or
   ```
   node app.js
   ```

2. Verify the application is running correctly. You should see:
   ```
   Server started running on : 3000
   Connected to PostgresSQL
   ```

3. Access the application in your web browser:
   ```
   http://localhost:3000
   ```

## Features

### Writing Practice

Navigate to the writing page to practice your English writing skills. The application will check your grammar in real-time and highlight any errors.

### Grammar Checking

The application uses the LanguageTool API to check for grammar, spelling, and punctuation errors. Errors are underlined in different colors based on their type:
- Red: Spelling errors
- Blue: Grammar errors
- Orange: Tense-related errors, including time indicator mismatches

### Time Indicator Detection

A special feature of this application is its ability to detect mismatches between verb tenses and time indicators. For example, if you write "Tomorrow I went to the store," the application will highlight both "Tomorrow" and "went" as errors because "Tomorrow" (future) doesn't match with "went" (past tense).

## Project Structure

- `app.js` - Main application file
- `public/` - Static files (CSS, JavaScript, images)
  - `js/grammarChecker2.js` - Grammar checking functionality
  - `js/chrono-fallback.js` - Time detection fallback
- `views/` - EJS templates
  - `writing.ejs` - Writing practice page
- `controller/` - Route controllers
- `route/` - Express routes
- `model/` - Data models

## Dependencies

The project relies on the following npm packages:

### Core Dependencies
- **express**: Web framework for Node.js
- **ejs**: Templating engine for generating HTML
- **body-parser**: Middleware for parsing request bodies
- **express-session**: Session middleware for Express
- **pg**: PostgreSQL client for Node.js

### Routing and Organization
- **express-group-routes**: Express middleware for grouping routes
- **express-route-grouping**: Additional route organization
- **express-router-group**: Router grouping functionality

### File Handling
- **multer**: Middleware for handling multipart/form-data (file uploads)

### UI and Interaction
- **alert**: Simple JavaScript alert system
- **dialog-node**: Dialog creation utility
- **popups**: Popup dialog functionality

### Utilities
- **crypto**: Cryptographic functionality
- **gin**: Utility library

### Grammar and Time Detection
- **chrono-node**: Natural language date parser used for time indicator detection

## Troubleshooting

- If you encounter issues with the grammar checking API, check your internet connection and make sure the LanguageTool API is accessible.
- If time indicator detection isn't working, check the browser console for any errors related to the chrono library.

## License

This project is licensed under the MIT License.
