
# 🚍  brahmosBus - Backend

brahmosBus backend provides the server-side functionality for the bus reservation system, handling user authentication, data management, and API endpoints that the frontend interacts with.


## 🎨 Key Features

- **Easy Bus Reservation:** Smooth booking process with dynamic seat selection.
- **User Authentication:** Secure login and signup with JWT authentication.
- **Responsive Design:** Optimized for desktops, tablets, and mobile devices.


## Tech Stack
#### Backend Stack
- **Node.js** -	Server runtime
- **Express.js** - Web application framework
- **MongoDB** -	Database
- **Mongoose** - MongoDB ORM
- **JWT** - JSON Web Token for authentication
- **Render** - Hosting
## Demo

- **Frontend:** [https://brahmosbus.netlify.app/](https://brahmosbus.netlify.app/)
- **Backend API Base URL:** [https://brahmosbackend.onrender.com](https://brahmosbackend.onrender.com)


## 🛠️Setup Instructions
### Prerequisites
- Node.js and npm installed on your local machine.
- MongoDB URI for database access.

1.  **Clone the Repository:**

```bash
  git clone https://github.com/Debarghya001/Brahmos-Backend-System.git
```

2. **Go to the project directory:**

```bash
  cd Brahmos-Backend-System
```

3. **Install dependencies:**

```bash
  npm install
```
4. **Environment Variables:**
  - Create a ``` .env``` file in the configuration directory with the following variables:
```bash
 DB_URI=<Your MongoDB URI>
 JWT_SEC=<Your JWT Secret>
 PORT=5000
 SALT=<Your Salt Value>
 ```
5. **CORS Configuration for Local Testing:**

 - Update the ```corsOptions``` in your ```index.js``` file to allow the local frontend
 ```bash
 const corsOptions = {
  origin: 'http://localhost:3000', // Use local frontend URL for testing
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
```
6. **Start the Application:**
```bash
  nodemon start
```
6. **Accessing the App:**
  - Once the server is running, the API will be accessible at http://localhost:5000.

7. **Go to frontend Repository:**
  - [Frontend](https://github.com/Debarghya001/Brahmos-Frontend-System?tab=readme-ov-file)
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`DB_URI=<Your MongoDB URI>`

`JWT_SEC=<Your JWT Secret>`

`PORT=5000`

`SALT=<Your Salt Value>`


## Contributing

Contributions are always welcome!

1. Fork the repository and create a new branch:

```bash
git checkout -b feature-branch
```
2. Make your changes and test thoroughly.

3. Commit and push your changes:
```bash
git commit -m "Added new feature"
git push origin feature-branch
```
4. Submit a Pull Request, describing the feature or fix in detail.

## Acknowledgements
We would like to thank the following resources that contributed to the design and user experience of brahmosBus:
 - [MUI](https://mui.com/)
 - [UIverse](https://uiverse.io/)
 - [UIBALL](https://uiball.com/)

