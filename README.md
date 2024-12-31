# NGO Connect Backend API

This repository contains the backend API developed for a web application designed to connect NGOs with volunteers. Built with Express.js, Node.js, MongoDB, and secured with JWT (JSON Web Tokens), this API empowers NGOs to manage their campaigns and projects effectively, while providing a streamlined login experience for both NGOs and volunteers.


## Features

- **NGO Management:** Core functionalities to create, retrieve, update, and delete NGO profiles are implemented.
- **Campaign Management:** The API supports full CRUD operations for NGO campaigns, allowing effective management of outreach efforts.
- **Project Management:** Similar to campaigns, project management is fully supported, enabling NGOs to organize and track initiatives.
- **User (Volunteer) Management:** User registration and login features facilitate volunteer participation.
- **Secure Authentication:** JWT-based authentication ensures secure access to protected API routes.
- **Data Persistence:** MongoDB serves as the database for persistent data storage.

## Technologies Used

- **Node.js:** The runtime environment for executing JavaScript server-side.
- **Express.js:** The web application framework that structures the API.
- **MongoDB:** The NoSQL database used for data storage.
- **Mongoose:** The MongoDB object modeling tool that simplifies database interactions.
- **JWT (JSON Web Tokens):** Used for robust authentication and authorization.
- **bcrypt:** For securely hashing passwords before storage.
- **dotenv:** For managing environment variables, keeping sensitive information out of the codebase.
