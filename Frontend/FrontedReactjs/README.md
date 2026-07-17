# Beauty AI - Frontend

This is the frontend application for the **Beauty AI** platform. It provides interfaces for three main user roles: Customers, Business Owners (Salons), and System Administrators.

The application is built with modern web technologies, prioritizing performance, responsiveness, and a premium user experience.

## 🚀 Tech Stack

- **Framework:** [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Routing:** [React Router](https://reactrouter.com/) (v7)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching:** [Axios](https://axios-http.com/) & [React Query](https://tanstack.com/query/latest)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/) (Headless UI)
- **Charts/Data Vis:** [Recharts](https://recharts.org/)

## 📂 Project Structure

```
src/
├── api/          # Axios instances and API service calls (auth, booking, admin, etc.)
├── components/   # Reusable UI components
│   ├── admin/    # Admin-specific components
│   ├── business/ # Business dashboard components (e.g., NewBookingModal)
│   ├── common/   # Layouts, Navigation, etc.
│   └── ui/       # Generic UI elements (Buttons, Inputs, Cards)
├── contexts/     # React Context providers (if any)
├── data/         # Static data / Mock data (services.json, staff.json, etc.)
├── pages/        # Route components (Views)
│   ├── admin/    # Admin dashboard pages
│   ├── business/ # Business owner dashboard pages
│   └── public/   # Customer-facing pages (Home, Search, Booking, etc.)
├── stores/       # Zustand state stores (e.g., useAuthStore)
├── App.jsx       # Main application root component
├── AppRouter.jsx # Defines all application routes and role-based protection
├── index.css     # Global CSS and Tailwind directives
└── main.jsx      # React DOM rendering entry point
```

## 🛠 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- `npm` or `yarn`

### Installation
1. Clone the repository.
2. Navigate to the frontend directory:
   ```bash
   cd Frontend/FrontedReactjs
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally
To start the development server:
```bash
npm run dev
```
*(On some Windows machines where execution policies block npm scripts, you may need to use `npm.cmd run dev`)*

The app will typically run on `http://localhost:5173/` (or `5174` if `5173` is in use).

### Building for Production
To create an optimized production build:
```bash
npm run build
```
This will output the static files to the `dist/` directory.

To preview the production build locally:
```bash
npm run preview
```

## 🔐 Authentication & Roles

The application uses role-based access control handled through `AppRouter.jsx` and protected route wrappers.

- **Admin (`/admin/*`)**: System management, user/salon approvals, global reports.
- **Business (`/business/*`)**: Salon dashboard, appointment management, staff/service management.
- **Customer (`/*`)**: Discovering salons, booking appointments, user profile.

Tokens are typically stored in local storage and managed via the `useAuthStore` (Zustand). All API calls to the backend include the authorization token via an Axios interceptor.
