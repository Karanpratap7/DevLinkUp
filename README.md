# DevLinkUp

A platform for developers to connect, showcase their projects, and collaborate with others.

## Features

- User authentication (register, login, logout)
- Profile management
- Project showcase
- Developer discovery
- Technology stack filtering
- Real-time notifications
- Responsive design

## Tech Stack

- Frontend:
  - React
  - Vite
  - Tailwind CSS
  - Headless UI
  - Axios
  - React Router
  - Jest & React Testing Library

- Backend:
  - Node.js
  - Express
  - MongoDB
  - JWT Authentication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/devlinkup.git
   cd devlinkup
   ```

2. Install dependencies:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Set up environment variables:
   - Create `.env.development` and `.env.production` files in the client directory
   - Create `.env` file in the server directory

4. Start the development servers:
   ```bash
   # Start the backend server
   cd server
   npm run dev

   # Start the frontend development server
   cd ../client
   npm run dev
   ```

## Testing

```bash
# Run frontend tests
cd client
npm test

# Run backend tests
cd server
npm test
```

## Deployment

1. Build the frontend:
   ```bash
   cd client
   npm run build
   ```

2. Deploy the backend:
   ```bash
   cd server
   npm run build
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Headless UI](https://headlessui.dev/)
- [Vite](https://vitejs.dev/) 