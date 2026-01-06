# Reveal SDK Client Documentation

This directory contains the client-side HTML files for the Reveal SDK MySQL sample application. These files demonstrate how to integrate Reveal BI dashboards into a web application.

## Overview

The client application provides a modern, single-page interface for working with Reveal BI dashboards. It includes navigation between different dashboard examples and showcases various integration patterns.

## File Descriptions

### index.html - Dashboard Hub (Main Navigation Page)

`index.html` is the main entry point and navigation hub for the client application. It provides a unified interface with a collapsible sidebar for navigating between different dashboard examples.

**Key Features:**
- **Sidebar Navigation**: A collapsible sidebar with visual indicators for the currently active page
- **Iframe Integration**: Loads different dashboard examples in iframes without page reloads
- **Three Dashboard Examples**:
  - **Load Dashboard**: Demonstrates loading pre-existing dashboards from the server
  - **Data Sources**: Shows how to create new dashboards with MySQL data sources
  - **Dynamic Data Sources**: Illustrates dynamic data source configuration with user context

**Technical Details:**
- Uses vanilla JavaScript for navigation and sidebar toggle functionality
- Implements page switching through iframe containers
- Includes loading indicators for better UX
- Responsive design with collapsible sidebar for smaller screens
- SVG icons from Lucide for modern UI elements

**How It Works:**
1. The page loads with three hidden iframes, one for each example
2. When a user clicks a navigation link, the corresponding iframe becomes visible
3. The sidebar can be collapsed/expanded using the toggle button
4. The active page is tracked and highlighted in the navigation menu

### load-dashboard.html - Dashboard Loading Example

`load-dashboard.html` demonstrates how to load and display existing dashboards from the server. This is the most common use case for embedding Reveal BI in an application.

**Key Features:**
- **Dashboard Selection**: Dropdown menu populated dynamically from the server
- **Dynamic Loading**: Fetches available dashboards from the API endpoint `/dashboards/names`
- **Interactive Dashboards**: Displays fully interactive Reveal BI dashboards
- **Loading Indicators**: Visual feedback during dashboard loading

**Technical Details:**
- Uses jQuery (required by Reveal SDK)
- Integrates Reveal SDK JavaScript library (v1.8.1)
- Connects to the server at `http://localhost:5111/`
- Implements `RevealView` component for dashboard rendering
- Enables interactive filtering on dashboards

**How It Works:**
1. On page load, fetches the list of available dashboards from the server
2. Populates a dropdown menu with dashboard titles
3. Loads the first dashboard by default
4. Users can switch between dashboards using the dropdown
5. Each dashboard is loaded using `$.ig.RVDashboard.loadDashboard()`
6. The dashboard is rendered in the `#revealView` container

**API Integration:**
- `GET /dashboards/names` - Retrieves list of available dashboards
- Returns JSON array with `dashboardFileName` and `dashboardTitle` properties

## Prerequisites

Before running the client application, ensure you have:

1. **Server Running**: The Reveal SDK server must be running on `http://localhost:5111/`
   - See the `/server` directory for server setup instructions
   - The server provides the Reveal SDK API endpoints and dashboard files

2. **Web Browser**: A modern web browser with JavaScript enabled
   - Chrome, Firefox, Edge, or Safari (latest versions)

3. **Internet Connection**: Required for loading external dependencies:
   - jQuery (v3.6.0)
   - Day.js (v1.8.21)
   - Reveal SDK JavaScript library (v1.8.1)
   - Lucide icons (for index.html)

## Getting Started

### Option 1: Direct File Access (Simple)

1. Ensure the server is running on `http://localhost:5111/`
2. Open `index.html` in your web browser
3. Navigate between examples using the sidebar

### Option 2: Local Web Server (Recommended)

For better security and to avoid CORS issues, serve the files through a local web server:

```bash
# Using Python 3
cd client
python -m http.server 8080

# Using Node.js http-server
npm install -g http-server
cd client
http-server -p 8080

# Using PHP
cd client
php -S localhost:8080
```

Then open `http://localhost:8080/index.html` in your browser.

## Configuration

### Server URL

The server URL is configured in each HTML file. To change it, update the following line:

```javascript
$.ig.RevealSdkSettings.setBaseUrl("http://localhost:5111/");
```

Replace `http://localhost:5111/` with your server's URL.

### Production Considerations

**Important**: The examples use CDN links for dependencies. For production environments:

1. **Download Dependencies Locally**: 
   - Download jQuery, Day.js, and Reveal SDK files
   - Store them in the `client` directory
   - Update script tags to reference local files

2. **Security**: 
   - Implement proper authentication
   - Use HTTPS for all connections
   - Configure CORS policies appropriately

3. **Performance**:
   - Minify JavaScript files
   - Enable caching
   - Use a CDN for static assets

## File Structure

```
client/
├── README.md                    # This file
├── index.html                   # Main navigation hub
├── load-dashboard.html          # Dashboard loading example
├── index-ds.html                # Data sources example
├── index-dsi.html               # Dynamic data sources example
├── test-usercontext.html        # User context testing
└── styles/
    └── common.css               # Shared styles
```

## Additional Resources

- **Main Repository README**: See `/README.md` for overall project documentation
- **Server Documentation**: See `/server` directories for server setup
- **Reveal SDK Documentation**: [https://help.revealbi.io/web/](https://help.revealbi.io/web/)
- **JavaScript API Reference**: [https://help.revealbi.io/api/javascript/latest/](https://help.revealbi.io/api/javascript/latest/)
- **Developer Playground**: [https://help.revealbi.io/playground/](https://help.revealbi.io/playground/)

## Troubleshooting

### Dashboard Not Loading

- **Check Server**: Ensure the server is running on `http://localhost:5111/`
- **Check Console**: Open browser developer tools and check for errors
- **CORS Issues**: Use a local web server instead of opening files directly
- **Port Conflicts**: Ensure port 5111 is not blocked by firewall

### Dropdown Shows "Error loading dashboards"

- **Server Not Running**: Start the server first
- **Network Issues**: Check network connectivity
- **API Endpoint**: Verify `/dashboards/names` endpoint is accessible
- **Server Logs**: Check server console for error messages

### Empty Dashboard View

- **Dashboard Files**: Ensure dashboard files exist in the server's dashboards directory
- **Permissions**: Check file permissions on the server
- **File Names**: Verify dashboard file names match those returned by the API

## Support

For issues, questions, or feature requests:

- **GitHub Issues**: [https://github.com/RevealBi/Reveal.Sdk/issues](https://github.com/RevealBi/Reveal.Sdk/issues)
- **Discord**: [https://discord.gg/reveal](https://discord.gg/reveal)
- **GitHub Discussions**: [https://github.com/RevealBi/Reveal.Sdk/discussions](https://github.com/RevealBi/Reveal.Sdk/discussions)
