<div align="center">
  <h1>ApplyFlow</h1>
  <p><strong>The Ultimate Open-Source Career Management & Automation Platform</strong></p>
  <img src="./ApplyFlow-Frontend/public/image.png" alt="ApplyFlow UI Screenshot" width="800" style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-top: 20px;"/>
  
  <br/><br/>
  
  <!-- Replace href with actual path once PDF is placed in docs/ -->
  <a href="./docs/ApplyFlow_Documentation.pdf" target="_blank">
    <img src="https://img.shields.io/badge/📖_Download_Documentation-PDF-red?style=for-the-badge&logo=adobeacrobatreader&logoColor=white" alt="Download Documentation PDF" />
  </a>
</div>

<br/>

<p align="center">
  <a href="#-about-applyflow">About</a> •
  <a href="#-comprehensive-features--modules">Modules & Features</a> •
  <a href="#-tech-stack--architecture">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-testing-the-application">Testing Guide</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## 🚀 About ApplyFlow

**ApplyFlow** is a comprehensive, enterprise-grade career management platform designed to completely revolutionize the job-hunting experience. Most applicants track jobs in spreadsheets and build resumes in word processors, creating a scattered, manual process. 

ApplyFlow consolidates **ATS Resume Building**, **Automated Email Outreach**, **Job Discovery**, and **Pipeline Analytics** into one unified, visual ecosystem. By treating the job search like a modern sales pipeline (CRM), ApplyFlow helps you apply smarter, faster, and more consistently.

![ApplyFlow Dashboard Overview](./ApplyFlow-Frontend/public/image%20copy.png)

## ✨ Comprehensive Features & Modules

### 1. ATS-Friendly Resume Builder
Most modern companies use Applicant Tracking Systems (ATS) to filter resumes. ApplyFlow ensures your resume is always machine-readable while maintaining a professional design.
* **Smart Templates**: Choose from dozens of industry-standard templates.
* **One-Click PDF Export**: Download as a high-quality PDF directly to your machine.
* **Keyword Optimization**: Tailor your resume to match specific job descriptions dynamically.
![ATS Resume Builder & Templates](./ApplyFlow-Frontend/public/image%20copy%204.png)

### 2. Job Discovery & Suggestions
No more endless scrolling on job boards. ApplyFlow's smart suggestion engine brings the jobs to you.
* **Personalized Feeds**: Job suggestions tailored to your specific skillset and past searches.
* **One-Click Save**: Push jobs directly into your application pipeline with a single click.
![Job Suggestions](./ApplyFlow-Frontend/public/image%20copy%204.png)

### 3. Visual Automation Workflows
Visualize your job search process using our intuitive drag-and-drop workflow builder.
* **Custom Pipelines**: Define application stages (e.g., Sourced, Applied, Interviewing, Offer).
* **Triggers & Actions**: Automatically move applications to different stages based on email replies, dates, or manual updates.
![Workflow Example](./ApplyFlow-Frontend/public/image%20copy%203.png)

### 4. Automated Email Campaigns
Stop sending manual follow-ups. ApplyFlow integrates with your email to handle outreach automatically.
* **Email Sequences**: Create multi-step drip campaigns for recruiters and hiring managers.
* **Template Variables**: Personalize emails at scale using smart tags (e.g., `{{company_name}}`, `{{role}}`, `{{hiring_manager_name}}`).
![Send Mail Automation](./ApplyFlow-Frontend/public/image%20copy%202.png)

### 5. Advanced Analytics Dashboard
Take a data-driven approach to job hunting. Know exactly where you stand.
* **Conversion Rates**: Track your Application-to-Interview and Interview-to-Offer ratios.
* **Weekly Goals**: Set and monitor your weekly application targets and pipeline health.

## 💻 Tech Stack & Architecture

### Frontend (Client-Side)
- **Framework:** React.js / Next.js
- **Language:** TypeScript
- **Styling:** TailwindCSS, Framer Motion (Animations)
- **State Management:** Redux Toolkit / React Query

### Backend (Server-Side)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens) & OAuth 2.0
- **Email Service:** Nodemailer / SendGrid API integration

## 🛠️ Getting Started

### Prerequisites
Ensure you have the following installed locally:
- [Node.js](https://nodejs.org/) (v16.x or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas)
- Git

### Installation Guide

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-organization/applyflow.git
   cd applyflow
   ```

2. **Backend Setup & Environment**
   ```bash
   cd ApplyFlow-Backend
   npm install
   
   # Create environment variables file
   cp .env.example .env
   ```
   **Required `.env` variables for Backend:**
   - `PORT` = 5000
   - `MONGODB_URI` = your_mongodb_connection_string
   - `JWT_SECRET` = your_secure_jwt_secret
   - `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` (for email automation)

   ```bash
   # Start the backend server in development mode
   npm run dev
   ```

3. **Frontend Setup & Environment**
   ```bash
   # Open a new terminal and navigate to Frontend
   cd ../ApplyFlow-Frontend
   npm install
   
   # Create environment variables file
   cp .env.example .env
   ```
   **Required `.env` variables for Frontend:**
   - `NEXT_PUBLIC_API_URL` = http://localhost:5000/api
   
   ```bash
   # Start the frontend server
   npm run dev
   ```

## 🧪 Testing the Application

ApplyFlow includes comprehensive testing suites to ensure reliability. Here is how you can run tests to verify your setup, validate new features, or ensure there are no regressions.

### Backend Testing (API & Logic)
We use **Jest** and **Supertest** for testing the Express API routes, models, and controllers.
```bash
cd ApplyFlow-Backend
# Run all unit and integration tests
npm test

# Run tests and generate a code coverage report
npm run test:coverage
```
*Note: Ensure you have a separate `TEST_MONGODB_URI` in your `.env.test` file so you do not overwrite your development database during testing.*

### Frontend Testing (Components & UI)
We use **React Testing Library** and **Vitest** (or Jest) for testing React components.
```bash
cd ApplyFlow-Frontend
# Run component tests
npm test

# Run tests in watch mode (ideal for development)
npm run test:watch
```

### End-to-End (E2E) Testing
For full user flow testing (e.g., logging in, building a resume, creating an automation), we utilize **Cypress**.
```bash
cd ApplyFlow-Frontend
# Opens the Cypress visual testing suite
npm run cypress:open

# Run E2E tests headlessly in the terminal (for CI/CD pipelines)
npm run cypress:run
```

## 📚 Official Documentation

For a deep dive into API endpoints, database schemas, and architectural decisions, please refer to our full documentation.

**[📥 Click Here to Download the Full Documentation (PDF)](./docs/ApplyFlow_Documentation.pdf)**  
*(Ensure you have downloaded the PDF package or find it under the `/docs` folder in the repository.)*

## 🤝 Contributing
We love community contributions! To get started:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please review our `CONTRIBUTING.md` for coding standards.

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
