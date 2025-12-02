# Ceremic - Handcrafted Ceramics E-Commerce

A modern, trendy React web application for showcasing and selling handcrafted ceramics products.

## Features

- 🏺 Beautiful, modern landing page with ceramics theme
- 📱 Fully responsive design
- 🎨 Trendy UI with earthy color palette
- 🚀 Optimized for GitHub Pages deployment

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Ceremic
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to '`

## Building for Production

To build the project for production:

```bash
npm run build
```

## Deploying to GitHub Pages

1. Install gh-pages if not already installed:
```bash
npm install --save-dev gh-pages
```

2. Deploy to GitHub Pages:
```bash
npm run deploy
```

This will:
- Build the project
- Deploy the `dist` folder to the `gh-pages` branch
- Make your site available at `https://<username>.github.io/Ceremic/`

**Note:** Make sure to update the `base` path in `vite.config.js` to match your repository name if it's different from "Ceremic".

## Project Structure

```
Ceremic/
├── public/
├── src/
│   ├── App.jsx          # Main app component
│   ├── App.css          # App styles
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── vite.config.js       # Vite configuration
└── package.json
```

## Technologies Used

- React 18
- Vite
- CSS3 (Custom properties, Grid, Flexbox)
- Google Fonts (Playfair Display, Inter)

## Future Features

- Product listing page
- Shopping cart functionality
- Order placement system
- User authentication
- Product detail pages

## License

MIT


