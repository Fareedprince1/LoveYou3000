# LoveYou3000 // Cinematic Immersive Portfolio

A premium, high-performance web portfolio inspired by the technical brilliance of Stark Industries. This project features a 300-frame, scroll-driven cinematic animation that reveals a professional digital portfolio.

![License](https://img.shields.io/badge/license-MIT-blue)
![Tech](https://img.shields.io/badge/tech-Vanilla_JS-orange)
![Design](https://img.shields.io/badge/design-Obsidian_Glass-lightgrey)

## ✨ Features

- **Cinematic Immersive Mode**: A full-viewport Iron Man reveal sequence that lives in your scrollbar.
- **Obsidian Glass V5 Design System**: Low-profile technical HUD, geometric typography, and OLED-dark aesthetic.
- **High-Performance Frame Hub**: Intelligent frame streaming (20-frame priority load + background stream) for zero-lag interaction.
- **Bento Grid Work Section**: Interactive project cards with glassmorphism and adaptive layout.
- **Adaptive Framing**: Seamlessly switches between 'Cover' logic for Desktop and 'Contain' logic for Mobile.

## 🚀 Quick Start

1. **Deploy Assets**: Place your 300 animation frames into the `/new video frame/` directory.
2. **Local Preview**:
   ```bash
   npx serve ./
   ```
3. **Customize**: Edit `script.js` to change the frame count or `style.css` to tweak primary accent colors.

## 📁 Architecture

This project is built for professional modularity and clean deployment:

- `index.html`: Unified entry point and semantic structure.
- `style.css`: Master design system and responsive tokens.
- `script.js`: Core cinematic engine and scroll-driven logic.
- `/new video frame/`: Asset directory for the 300 sequential animation frames.

## 🛠 Tech Stack

- **HTML5 Canvas**: Frame rendering engine.
- **Vanilla JavaScript**: Lightweight scroll-state management.
- **CSS Grid/Flexbox**: High-fidelity Bento layout.
- **Intersecting Observer API**: Strategic content reveals.

---

*“I love you 3000.”*
