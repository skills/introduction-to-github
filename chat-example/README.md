
# Studio App: Gemini Demos

This project contains three separate web applications.

1.  **Gemini Chat Demo**: A simple application demonstrating chat functionality.
2.  **Gemini Code Execution Demo**: An application that demonstrates how to use the Gemini API's code execution feature.
3.  **GRS Gold House Bill Generator**: A utility for generating bills and estimates, featuring AI-powered item description generation.

## Run Locally

**Prerequisites:** You will need [Node.js](https://nodejs.org/) installed on your computer.

### 1. Set Up Your API Key

The Gemini demos require a Gemini API key.

*   Create a new file named `.env` in the root of the project folder.
*   Add your API key to this file like so:

```
GEMINI_API_KEY="YOUR_API_KEY_HERE"
```

Replace `YOUR_API_KEY_HERE` with the key you have. The build process is already configured to use this variable. **Do not paste your key anywhere else.**

### 2. Install Dependencies

Open a terminal in the project's root folder and run the following command:

```bash
npm install
```

### 3. Run the Development Server

Once the dependencies are installed, run this command to start the local server:

```bash
npm run dev
```

The server will typically start on `http://localhost:5173`.

### 4. Access the Applications

You can now open the applications in your web browser:

*   **Gemini Chat Demo**:
    Navigate to [http://localhost:5173/index.html](http://localhost:5173/index.html)

*   **Gemini Code Execution Demo**:
    Navigate to [http://localhost:5173/index-1.html](http://localhost:5173/index-1.html)

*   **GRS Gold House Bill Generator**:
    Navigate to [http://localhost:5173/index-1-1.html](http://localhost:5173/index-1-1.html)
