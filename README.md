
# AI Crypto Advisor

## Overview
AI Crypto Advisor is a full-stack web application that allows users to:
- Register and log in securely
- Save crypto investment preferences
- Store onboarding selections in a database
- Manage personalized crypto-related content

The project was built using a React frontend and a Node.js + Express backend with SQLite as the database.

---

# About The Project

AI Crypto Advisor is a personalized crypto onboarding and preference management platform.  
The application helps users define their crypto interests, investment style, and preferred content categories in order to create a more customized crypto experience.

Users can:
- Create an account and log in securely
- Complete an onboarding flow
- Select favorite crypto assets
- Choose investment preferences and content interests
- Save their preferences into a database

The system includes authentication, API communication between frontend and backend, persistent database storage, and full deployment to production environments.

---

# Live Deployment

## Frontend
https://ai-crypto-advisor.netlify.app/

## Backend
https://ai-crypto-advisor-6bel.onrender.com/

---

# API Endpoints

## Get Users
GET https://ai-crypto-advisor-6bel.onrender.com/api/users

## Register User
POST /api/auth/register

## Login User
POST /api/auth/login

## Save Preferences
POST /api/preferences

---

# Tech Stack

## Frontend
- React
- React Router
- Axios
- Vite

## Backend
- Node.js
- Express.js
- SQLite3
- JWT Authentication
- bcrypt

## Deployment
- Netlify (Frontend)
- Render (Backend)

---

# Database

The application uses SQLite as the database.

Tables:
- users
- preferences
- votes

The database is automatically created when the backend server starts.

---


# AI Tools Usage Summary

During this assignment, AI tools such as ChatGPT and Claude were used as development assistants throughout the project.

I designed and planned the project architecture, application structure, and overall flow independently.  
The AI tools were used as collaborative development assistants to help implement and improve parts of the system during development.

The AI tools helped with:
- Writing and improving parts of the frontend and backend code
- Solving deployment problems with Netlify and Render
- Understanding SQLite database behavior in production
- Supporting deployment configuration and environment setup

The coding process was guided by my own decisions and implementation direction, while the AI tools assisted by suggesting solutions, explaining errors, and helping accelerate development.


# Future AI Training & Feedback Improvements

As a future improvement, the platform could include a feedback and training pipeline connected to the dashboard system.

The application already stores user preferences and voting interactions, which could later be used as feedback signals for improving AI recommendation quality over time.

Possible future flow:
- Users interact with crypto recommendations and dashboard content
- User actions such as likes/dislikes, selected assets, onboarding preferences, and engagement are stored in the database
- Feedback data is collected and analyzed periodically
- The collected information can later be used to:
  - Improve recommendation accuracy
  - Personalize content for different investor types
  - Train or fine-tune machine learning models
  - Detect user interest trends and behavioral patterns

For example, if users with similar onboarding preferences consistently engage with specific crypto assets or content types, the system could learn to prioritize similar recommendations for future users.

Currently, the application stores user interaction data inside the SQLite database, which creates a foundation for future analytics and AI model improvement pipelines.
