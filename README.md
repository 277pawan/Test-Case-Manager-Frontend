# Test Case Manager - Frontend

A modern, responsive React-based frontend for the Test Case Management System with role-based UI and real-time updates.

## 🚀 Features

### User Interface

- **Modern Design**
  - Clean, professional UI with gradient accents
  - Responsive design (mobile, tablet, desktop)
  - Dark mode support
  - Smooth animations and transitions
  - Loading states and skeletons

### Core Features

- **Authentication**
  - Secure login/logout
  - JWT token management
  - Automatic token refresh
  - Protected routes

- **Dashboard**
  - Real-time analytics
  - Project statistics
  - Test execution metrics (Pass/Fail charts)
  - Priority distribution (Pie chart)
  - Color-coded status indicators (Green=Pass, Red=Fail)

- **Project Management**
  - Create/edit projects
  - View project details
  - Role-based project visibility
  - Search and filter

- **Test Case Management**
  - Create test cases with user assignment
  - Edit test case details
  - View test case history
  - Filter by status, priority, type
  - Reopen passed test cases (Admin only)

- **Test Execution**
  - Interactive test runner
  - Step-by-step execution
  - Real-time status updates
  - Execution history
  - Permission checks before execution

- **Permission Management**
  - Grant/revoke execution permissions (Admin)
  - View permitted users
  - View permitted users
  - Permission modal interface

- **Collaborative Features**
  - **Email Alerts**: Get notified when assigned to a test case
  - **Comments**: Discuss directly on Test Case pages
  - **User Assignment**: Assign test cases during creation

### Role-Based Features

#### Admin

- See all projects
- Manage execution permissions
- Reopen passed test cases
- Create/edit/delete projects
- Full system access

#### Normal Users (Tester, Test Lead)

- See only assigned projects
- Create/edit test cases
- Execute tests (if granted permission)
- View analytics

## 🛠️ Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **UI Components**:
  - Custom components with shadcn/ui
  - Lucide React icons
- **Notifications**: React Hot Toast
- **Charts**: Chart.js with react-chartjs-2
- **Styling**: Tailwind CSS

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running on `http://localhost:5000`

## ⚙️ Installation

1. **Install dependencies**

```bash
npm install
```

2. **Set up environment variables**
   Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

3. **Start development server**

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

4. **Build for production**

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── ui/             # Base UI components
│   ├── CreateProjectModal.tsx
│   ├── CreateTestCaseModal.tsx
│   ├── ExecutionPermissionModal.tsx
│   └── ...
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── Projects.tsx
│   ├── ProjectDetails.tsx
│   ├── TestRunner.tsx
│   └── ...
├── context/            # React contexts
│   └── AuthContext.tsx
├── services/           # API services
│   └── api.ts
└── App.tsx            # Main app component
```

## 🎨 Key Components

### CreateTestCaseModal

- Form to create new test cases
- User assignment dropdown
- Priority and type selection
- Pre/Post conditions
- Fetches users from `/api/users`

### ExecutionPermissionModal

- Admin-only permission management
- Grant permission by email
- View permitted users list
- Revoke permissions
- Global execution rights management

### TestRunner

- Interactive test execution interface
- Step-by-step progress
- Status selection (Pass/Fail/Blocked/Skipped)
- Permission verification
- Results submission

### Dashboard

- Analytics overview
- Chart.js visualizations
- Real-time metrics
- Status-based color coding

## 🔐 Authentication Flow

1. User logs in → Receives JWT token
2. Token stored in localStorage
3. Axios interceptor adds token to all requests
4. Protected routes check authentication
5. Auto-redirect to login if unauthenticated

## 📊 Charts & Visualizations

### Test Execution Status Chart (Bar Chart)

- **Pass**: Green (#22c55e)
- **Fail**: Red (#ef4444)
- **Blocked**: Amber (#f59e0b)
- **Skipped**: Purple (#a855f7)
- **Pending**: Blue (#3b82f6)

### Priority Distribution (Pie Chart)

- Low, Medium, High, Critical breakdown
- Color-coded segments

## 🎯 User Experience Features

### Empty States

- **Admin with no projects**: "Create your first project"
- **User with no assignments**: "You are not added in any project. Contact admin."
- Clear, actionable messages

### Loading States

- Skeleton loaders for all data fetching
- Spinner animations
- Disabled buttons during operations

### Error Handling

- Toast notifications for all operations
- Graceful error messages
- Fallback UI components

## 🔄 State Management

- **AuthContext**: Global authentication state
- **React Router**: URL-based state
- **Local State**: Component-level with useState
- **Cache**: Browser localStorage for tokens

## 🚦 Routing

````
/ → Dashboard
/login → Login page
/projects → Projects list
/projects/:id → Project details
/test-runner/:id → Test execution


## 🔧 Development

```bash
# Start dev server
npm run dev
```

# Build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
````

## 📄 License

MIT
