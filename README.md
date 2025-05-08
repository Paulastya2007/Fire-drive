# 🔥 Fire Drive

## 📁 Project Overview

**GitHub Repository:** [https://github.com/Paulastya2007/Fire-drive](https://github.com/Paulastya2007/Fire-drive)

**Fire Drive** is a web application designed for secure and efficient file management. Built on Firebase, it offers seamless features for user authentication, file uploading, downloading, previewing, and organization through a clean and user-friendly interface.

### ✨ Main Features

* **🔐 User Authentication:** Secure sign-up and login using Firebase Authentication.
* **📤 File Management:** Easily upload, download, and delete files.
* **📂 File Listing:** Browse and manage your files through an intuitive interface.
* **🔎 File Preview:** View various file types directly within the app.
* **🗂️ File Organization:** Keep your files organized effortlessly.

---

## 🎨 Style Guidelines

The styling of this project follows the conventions defined in [`blueprint.md`](./docs/blueprint.md). All contributors should refer to this file to maintain a consistent visual style across the application.

---

## 🚀 Getting Started

To set up **Fire Drive** locally, follow these steps:

### 1. Clone the repository

```bash
git clone https://github.com/Paulastya2007/Fire-drive.git
cd Fire-drive
```

### 2. Configure Firebase

Update your Firebase configuration in `src/lib/firebase.ts` with your project's environment variables:

```ts
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
```

Make sure to define these variables in a `.env.local` file at the root of your project.

### 3. Enable Firebase Services

To ensure Fire Drive works correctly, make sure the following Firebase services are **enabled** in your Firebase console:

* **Email/Password Authentication** (via Firebase Authentication)
* **Firebase Storage** (for uploading and managing files)

---

✅ **You're all set!** Start the development server and explore Fire Drive.

---

## 🖼️ Screenshots

Here's a quick look at the app in action:

![image](https://github.com/user-attachments/assets/79a2f31f-6f81-4d01-a769-5b070ea33fd0)
![Screenshot 2025-05-08 202052](https://github.com/user-attachments/assets/df7640f4-5a16-4f87-898c-c4803665a0b4)
![Screenshot 2025-05-08 202029](https://github.com/user-attachments/assets/a13f361f-5176-4dd9-a93a-86f0e2fa4032)

---
