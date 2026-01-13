# Frontend Project Structure

This React frontend follows a modular, component-based architecture for maintainability and scalability.

## 📁 Directory Structure

```
src/
├── api.js                 # Axios instance configuration
├── App.js                 # Root application component
├── index.js               # Entry point
├── index.css              # Global styles
│
├── components/            # React components
│   ├── Dashboard.js       # Main dashboard container
│   ├── Login.js           # Login page
│   ├── dashboard/         # Dashboard-specific components
│   │   ├── DashboardSidebar.js
│   │   ├── DashboardHeader.js
│   │   ├── DashboardOverview.js
│   │   ├── ComplaintsView.js
│   │   ├── CustomersView.js
│   │   ├── TeamView.js
│   │   ├── HistoryView.js
│   │   └── modals/        # Modal components
│   │       ├── ComplaintFormModal.js
│   │       ├── AssignEngineerModal.js
│   │       ├── CompleteServiceModal.js
│   │       └── CloseTicketModal.js
│   └── ui/                # Reusable UI components
│       ├── Button.js      # Button variants
│       ├── Input.js       # Input, Textarea, Select
│       ├── Modal.js       # Modal with header/body/footer
│       ├── Card.js        # Card components
│       ├── Badge.js       # Status and priority badges
│       ├── Table.js       # Table components
│       ├── Toast.js       # Toast notifications
│       ├── Spinner.js     # Loading states
│       └── index.js       # Barrel export
│
├── constants/             # Application constants
│   ├── issueCategories.js # Issue category definitions
│   ├── priorityOptions.js # Priority configurations
│   ├── statusConfig.js    # Status badge configurations
│   ├── navigation.js      # Sidebar navigation items
│   └── index.js           # App-wide constants + exports
│
├── context/               # React Context providers
│   ├── AppContext.js      # Main app state context
│   └── index.js           # Context exports
│
├── hooks/                 # Custom React hooks
│   ├── useToast.js        # Toast notification hook
│   ├── useModal.js        # Modal state management
│   ├── useForm.js         # Form handling hook
│   ├── useFileUpload.js   # File upload hook
│   ├── useAppData.js      # App data fetching
│   └── index.js           # Hook exports
│
├── services/              # API service modules
│   ├── authService.js     # Authentication API
│   ├── complaintService.js# Ticket/complaint API
│   ├── customerService.js # Customer API
│   ├── machineService.js  # Machine API
│   ├── userService.js     # User management API
│   └── index.js           # Service exports
│
├── utils/                 # Utility functions
│   ├── dateUtils.js       # Date formatting
│   ├── fileUtils.js       # File handling
│   ├── phoneUtils.js      # Phone formatting
│   ├── validationUtils.js # Form validation
│   └── index.js           # General utilities + exports
│
└── lib/                   # Main barrel export
    └── index.js           # Re-exports everything
```

## 🎯 Usage Examples

### Importing UI Components
```javascript
import { Button, Modal, Badge, Input } from '../components/ui';
// or
import { Button, Modal } from '../lib';
```

### Using Constants
```javascript
import { STATUS_CONFIG, ISSUE_CATEGORIES, PRIORITY_OPTIONS } from '../constants';
// or
import { APP_NAME, WORK_START_HOUR, MAX_FILE_SIZE } from '../constants';
```

### Using Hooks
```javascript
import { useToast, useModal, useForm } from '../hooks';

function MyComponent() {
  const { toast, showToast, hideToast } = useToast();
  const { isOpen, open, close } = useModal();
  const { values, handleChange, handleSubmit } = useForm({ name: '' });
}
```

### Using Services
```javascript
import { complaintService, customerService } from '../services';

// Get all complaints
const complaints = await complaintService.getAll();

// Create customer
const customer = await customerService.create({ name: 'Test', email: 'test@test.com' });
```

### Using Utilities
```javascript
import { formatDate, formatFileSize, isValidEmail, debounce } from '../utils';

formatDate(new Date());        // "Dec 15, 2024"
formatFileSize(1024 * 1024);   // "1 MB"
isValidEmail('test@test.com'); // true
```

### Using Context
```javascript
import { AppProvider, useApp } from '../context';

// Wrap your app
<AppProvider user={user} onUserUpdate={handleUpdate}>
  <Dashboard />
</AppProvider>

// Use in components
function MyComponent() {
  const { appState, showToast, createComplaint } = useApp();
}
```

## 🎨 UI Component Variants

### Button
```javascript
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="success">Success</Button>
<Button variant="danger">Danger</Button>
<Button variant="ghost">Ghost</Button>
<Button size="sm" loading>Loading...</Button>
```

### Badge
```javascript
<Badge>Default</Badge>
<Badge variant="success">Success</Badge>
<StatusBadge status="pending" />
<PriorityBadge priority="high" />
```

### Modal
```javascript
<Modal isOpen={isOpen} onClose={close} size="lg">
  <ModalHeader>Title</ModalHeader>
  <ModalBody>Content here</ModalBody>
  <ModalFooter>
    <Button onClick={close}>Close</Button>
  </ModalFooter>
</Modal>
```

## 🔧 Configuration

### App Constants (constants/index.js)
- `APP_NAME` - Application name
- `WORK_START_HOUR` - Work start hour (9)
- `WORK_END_HOUR` - Work end hour (19)
- `MAX_FILE_SIZE` - Maximum upload size (100MB)
- `MAX_FILES` - Maximum files per upload (10)

### Environment Variables
Configure in `.env`:
```
REACT_APP_API_URL=http://localhost:4000/api
```

## 📝 Adding New Features

1. **New Component**: Add to `components/` or `components/ui/`
2. **New Constant**: Add to `constants/` and export from `index.js`
3. **New Hook**: Add to `hooks/` and export from `index.js`
4. **New Service**: Add to `services/` and export from `index.js`
5. **New Utility**: Add to `utils/` and export from `index.js`
