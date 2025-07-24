# Head Constable - Film Presentation

[![Status](https://img.shields.io/badge/status-github%20pages%20ready-success)](#deployment)
[![Security](https://img.shields.io/badge/security-client%20side%20protected-brightgreen)](#security)
[![Version](https://img.shields.io/badge/version-secure%20release-blue)](#features)

A secure, interactive presentation for the "Head Constable" film project, optimized for GitHub Pages deployment.

## 🔒 Security Features

This presentation implements **client-side security** suitable for GitHub Pages:

- **Secure Hash Authentication**: Uses SHA-256 hashing with salt
- **No Exposed Credentials**: Sensitive information is never stored in plain text
- **Session Management**: Authentication persists during browser session
- **Lockout Protection**: 5-minute lockout after 3 failed attempts
- **Content Protection**: Sensitive slides are dynamically protected

## 🎬 Features

- **Dual Mode Access**: Public and Admin viewing modes
- **Content Protection**: Sensitive slides (logline and story beats) are protected
- **Interactive Navigation**: Keyboard and mouse controls
- **Responsive Design**: Works on desktop and mobile devices
- **GitHub Pages Compatible**: Pure client-side implementation

## 🚀 Quick Start

This presentation is designed for GitHub Pages - no server setup required!

1. **Access the live presentation**: `https://dirakhil.github.io`
2. **Choose viewing mode**: Public or Admin
3. **Navigate**: Use keyboard shortcuts or on-screen controls

## ⌨️ Navigation

- **Arrow Keys**: Navigate between slides
- **Space/Enter**: Next slide
- **Backspace**: Previous slide
- **Home**: First slide
- **End**: Last slide
- **P**: Show mode selection
- **H**: Toggle help panel
- **1-9**: Jump to specific slide
- **F**: Toggle fullscreen mode
- **Esc**: Close popups / Exit fullscreen

## 🛡️ Security Implementation

- **Client-Side Hashing**: Uses Web Crypto API for secure hashing
- **No Server Dependencies**: Fully static implementation
- **Protected Content**: Sensitive slides are hidden until authenticated
- **Session Security**: Authentication state managed securely
- **No Credentials in Code**: All sensitive information is properly hashed

## 📱 Technical Details

- Pure HTML/CSS/JavaScript
- No server dependencies required
- Optimized for GitHub Pages deployment
- Mobile responsive design
- Modern browser compatibility (Chrome, Firefox, Safari, Edge)

## 🌐 Deployment

This presentation is designed for GitHub Pages deployment:

1. **Repository Setup**: Files are ready for GitHub Pages
2. **Enable Pages**: Go to repository Settings → Pages
3. **Select Source**: Deploy from `main` branch
4. **Access**: Visit `https://username.github.io/repository-name`

## 📋 Content Structure

1. **Title Slide**: Film introduction
2. **Logline**: 🔒 Protected content (Admin only)
3. **Genre & Duration**: Film specifications
4. **Characters**: Main character profiles
5. **Story Beats**: 🔒 Protected content (Admin only)
6. **Locations**: Filming locations
7. **Budget**: Production budget breakdown
8. **Crew**: Key crew members
9. **Contact**: Production contact information

## 🔐 Security Notes

- All sensitive information is protected using secure hashing
- No credentials are stored in the repository
- Authentication is session-based and secure
- Content protection is implemented at the client level
- Suitable for public repository hosting

## 📄 File Structure

```
├── index.html              # Main presentation file
├── css/
│   └── styles.css         # Presentation styles
├── js/
│   ├── secure_auth.js     # Secure authentication system
│   ├── script.js          # Presentation logic
│   └── help.js           # Help system
├── content/              # Presentation content (JSON)
├── images/              # Image assets
└── README.md           # This file
```

---

**Version**: Secure Release  
**Deployment**: GitHub Pages Ready  
**Security**: Client-side protected  
**Status**: ✅ Production ready