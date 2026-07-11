# UniSwap - Campus Platform

## Description
UniSwap is a premier student-to-student marketplace designed specifically for campus environments. It allows students to effortlessly buy, sell, and trade books, electronics, study materials, and everyday essentials safely within their own university ecosystem.

## Features
- **Secure Authentication:** User login, registration, and OTP verification specifically targeting student emails.
- **P2P Marketplace:** Upload, browse, search, and filter products seamlessly.
- **Direct Messaging:** Real-time Socket.IO powered chat interface for buyers and sellers, coupled with one-click WhatsApp integration.
- **In-App Notifications:** Real-time alerts for purchase requests, orders, and administrative broadcasts.
- **Admin Dashboard:** Comprehensive metrics and moderation tools to manage users, reports, and system settings.
- **Shopping Cart & Wishlist:** Fully integrated e-commerce features to save or bulk-buy items.
- **Cloud Storage Integration:** Scalable image handling for products and avatars powered by Cloudinary.

## Tech Stack
- **Frontend:** React.js, TailwindCSS, Redux Toolkit, React Router, Vite.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (Mongoose ORM).
- **Real-time Engine:** Socket.IO.
- **Storage:** Cloudinary / Multer.
- **Authentication:** JWT (JSON Web Tokens) & bcrypt.

## Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### Local Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/Ayush03-g/Uniswap.git
   ```
2. Navigate into the frontend and backend folders in separate terminals to install dependencies:
   ```bash
   # Terminal 1 (Frontend)
   cd client
   npm install

   # Terminal 2 (Backend)
   cd server
   npm install
   ```

3. Setup your environment variables (see below).

4. Start the development servers:
   ```bash
   # In frontend terminal
   npm run dev

   # In backend terminal
   npm run dev
   ```

## Environment Variables
Create a `.env` file in the `server` directory and configure the following variables (use `.env.example` as a template):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/uniswap
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## Screenshots
> *(Screenshots to be added here)*

## Deployment
UniSwap is architected for seamless production deployments on platforms like Render, Heroku, or Vercel. 
The backend elegantly statically serves the compiled frontend `dist` output.
1. Run `npm run build` in the `client` directory.
2. Set `NODE_ENV=production` in the server.
3. The server natively hosts the client at `/`.

## Author
Ayush Garg
