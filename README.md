# 🌍 MACRO-NODE TERMINAL

🔴 **LIVE DEPLOYMENT:** [greenyield-terminal.vercel.app]

## Overview
The **Macro-Node Terminal** is a real-time, geospatial intelligence dashboard engineered to aggregate fragmented macroeconomic data into a single, high-density UI. Built for quantitative analysis and global market tracking, it visualizes the intersection of geopolitics, sovereign debt, and multi-asset class performance directly on an interactive 3D globe.

Traditional finance tools often lock regional data behind complex navigations. This system bypasses that by using a dynamic mapping architecture—click any major global economy, and the terminal instantly synthesizes its core financial telemetry.

## ⚙️ Core Architecture & Features

* **Dynamic Asset Mapping:** Automatically identifies primary benchmark indices, local equities, and derivatives based on geographic selection using strict ISO-2 and ticker registries.
* **10-Point Strategic Portfolio Engine:** Generates a real-time allocation model for each region, weighing traditional fixed-income risk (10Y/2Y Sovereign Bonds) alongside ESG/Green Energy transition metrics.
* **Algorithmic Intelligence Feed:** Integrates a custom JavaScript-level sanitization filter over REST APIs to eradicate "spam" and PR noise. The feed strictly demands contextual relevance, ensuring only high-signal geopolitical, central bank, and macroeconomic shifts are rendered.
* **High-Performance 3D Rendering:** Utilizes WebGL via `Three.js` and `Globe.gl` for a seamless 60fps geospatial interface.
* **"Aero-Glass" UX/UI:** Engineered a responsive, semi-transparent data overlay (`backdrop-filter`) paired with a dynamic camera-shift algorithm (`translateX`), ensuring the 3D data-viz layer is never obstructed by the terminal panels.
* **Serverless Backend:** Deployed on Vercel utilizing parallel data fetching (Promise.all) for ultra-low latency execution.

## 🛠️ Technology Stack
* **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3 (Glassmorphism UI)
* **3D Visualization:** Three.js, Globe.gl
* **Backend:** Node.js (Vercel Serverless Functions)
* **Data Pipelines:** Finnhub API (Real-time Equities & Forex), NewsAPI (Geopolitical feeds), FlagsAPI

## 🚀 Local Development & Deployment

To run this project locally or deploy it to your own Vercel environment, you will need active API keys.

### Prerequisites
1. Get a free API key from [Finnhub.io](https://finnhub.io/)
2. Get a free API key from [NewsAPI.org](https://newsapi.org/)

### Local Setup
1. Clone the repository:
   ```bash
   git clone [https://github.com/YourUsername/macro-node-terminal.git](https://github.com/YourUsername/macro-node-terminal.git)
