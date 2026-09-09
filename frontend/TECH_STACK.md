# 🛠️ FarmConnect — Technology Stack Specification

## 1. Client Applications
* **Mobile Client (Primary):**
  * Framework: React Native with Expo SDK
  * Language: JavaScript (ES6+) / JSX
  * State Management: React Hooks (`useState`, `useEffect`, `useContext`)
  * Vision / Hardware: `expo-camera`, `expo-image-manipulator`, `expo-file-system`
  * Networking: Fetch API (JSON & Base64 / Multipart)
* **Admin & Web Portal:**
  * Framework: React.js with Vite
  * Styling: Pure CSS3 Grid / Flexbox layout system
  * Icons: Native Unicode & SVG icons

## 2. Backend & Server Tier
* **Runtime Environment:** Node.js (LTS)
* **Framework:** Express.js
* **Middleware:**
  * `cors`: Cross-Origin Resource Sharing
  * `dotenv`: Environment variable isolation
  * `multer`: Multipart/form-data upload handling
  * Body Parsers: Built-in Express JSON & URL-encoded handlers (10MB threshold)

## 3. Database & Storage Tier
* **Primary Database:** MongoDB Atlas (Cloud) / Local MongoDB Server
* **ODM:** Mongoose
* **Media / Image Handling:**
  * Primary: Base64 direct buffer evaluation
  * Secondary: Cloud file storage integration (Firebase Storage / AWS S3)

## 4. External Services & APIs
* **Authentication:** Firebase Authentication (Phone OTP, Google Sign-In, Email/Password)
* **Weather Service:** OpenWeatherMap OneCall API / IMD Agromet API
* **Mandi Rates:** Agmarknet / Government Open Data API (Data.gov.in)
* **Push Notifications:** Expo Notifications / Firebase Cloud Messaging (FCM)

## 5. Development & DevOps Tooling
* **Editor:** Visual Studio Code
* **Version Control:** Git & GitHub
* **Testing:** Postman / Thunder Client (REST API verification)
* **Build System:** Expo Application Services (EAS Build for standalone Android `.apk` / `.aab`)