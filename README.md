# VisionQuery Frontend - Vanilla JavaScript

This is a pure HTML/CSS/JavaScript frontend with no frameworks or build tools.

## Structure

```
frontend/
├── index.html          # Login & Register page
├── dashboard.html      # Main application dashboard
├── css/
│   └── style.css       # Dark mode modern styling
└── js/
    ├── api.js          # API client with token management
    ├── auth.js         # Authentication logic
    └── dashboard.js    # Dashboard functionality
```

## Features

- **Dark Mode UI**: Modern glassmorphism design
- **No Dependencies**: Pure vanilla JavaScript
- **JWT Authentication**: Token stored in localStorage
- **Responsive**: Works on desktop and mobile
- **No Build Step**: Just open `index.html` in a browser

## Usage

1. **Start Backend**: Make sure the FastAPI backend is running on `http://127.0.0.1:8000`

2. **Open Frontend**: 
   - Option 1: Open `index.html` directly in your browser
   - Option 2: Use a simple HTTP server:
     ```bash
     # Python
     cd frontend
     python -m http.server 8080
     # Then open http://localhost:8080
     ```

3. **Demo Flow**:
   - Register a new user
   - Login
   - Upload an image
   - Classify the image
   - Search images by text description
   - View search history

## API Integration

All API calls go through `js/api.js` which:
- Automatically attaches JWT tokens
- Handles 401 errors (redirects to login)
- Provides error handling
- Uses fetch API

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Notes

- Images are served from `http://127.0.0.1:8000/uploads/`
- CORS is configured to allow all origins (for local development)
- No console errors expected
- All state managed via localStorage and DOM
