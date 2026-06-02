# Charity Management System

Final Year Project

This project consists of a Node.js/Express backend and a React/Vite frontend.

## Quick Start Guide

### 1. Backend Setup

Open a terminal and set up the backend server:

```bash
cd backend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and update DATABASE_URL and JWT_SECRET with your values

# Initialize the database
npx prisma migrate dev --name init
npx prisma generate

# Start the development server
npm run dev
```

### 2. Frontend Setup

Open a new terminal window and set up the frontend application:

```bash
cd frontend
npm install

# Set up environment variables
cp .env.example .env
# Update any required environment variables in .env if needed

# Start the development server
npm run dev
```

## Features Overview

- **Backend (`/backend`)**: Node.js, Express, Prisma. Exposes REST APIs for Authentication, User Management, Charity Profiles, Campaigns, and Donations.
- **Frontend (`/frontend`)**: React 19, Vite, Tailwind CSS. Provides interfaces for Admins, Charities, and Donors.
