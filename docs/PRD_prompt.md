# Product Requirements Document (PRD) Prompt  
## Intelligent Task Manager with Smart Prioritization

You are an expert Product Owner specialized in digital product development and Agile best practices. Using the information provided below, generate a complete and production‑ready **Product Requirements Document (PRD)**. The PRD should be detailed enough to serve as the basis for system architecture diagrams, roadmap creation, feature breakdowns, acceptance criteria, and cross‑team alignment.

### Project Summary  
**Project Name:** Intelligent Task Manager  
**Description:** A single‑page application (SPA) to manage tasks with intelligent prioritization. Users can create projects, tasks, labels, deadlines, and priorities. An AI assistant analyzes the task descriptions and reorganizes priorities and suggested due dates.

### Technical Stack  
- **Frontend:** React + Vite + Zustand (or Redux Toolkit)  
- **Backend / API:** NestJS + TypeScript  
- **Database:** MongoDB  
- **DevOps:** Docker, AWS ECS deployment, GitHub Actions CI/CD  
- **AI:** Endpoint that processes task description and returns recommended priority and deadline  

### Development Plan  
1. Design the data model for projects, tasks, labels, and priority levels.  
2. Build a full REST API with NestJS including JWT-based authentication.  
3. Integrate an AI endpoint to suggest task priority and due date.

---

## Instructions for the Generated PRD

When generating the PRD, ensure the following sections are included:

### 1. Executive Summary  
Clear overview of the product, its purpose, and expected impact.

### 2. Problem Statement  
Why users need intelligent task management and the pain points solved.

### 3. Product Goals & KPIs  
Quantitative and qualitative objectives.

### 4. User Personas  
At least 3 well-defined personas.

### 5. User Stories & Acceptance Criteria  
Cover CRUD operations, authentication, prioritization logic, AI assistant interaction, and tagging system.

### 6. Functional Requirements  
Describe all core features:
- Project management  
- Task creation/editing  
- Tags and labels  
- Manual + AI-driven prioritization  
- Smart suggestions  
- Notifications (if applicable)  
- Authentication and session logic  
- Role management (if necessary)  

### 7. Non-Functional Requirements  
Performance, security, scalability, reliability, DevOps pipeline, logging, etc.

### 8. Data Model Requirements  
ERD‑ready descriptions for Projects, Tasks, Labels, Users, Priority levels.

### 9. API Requirements  
Endpoints with request/response examples. Include the AI endpoint.

### 10. Success Metrics  
Define how product value will be measured.

### 11. Risks & Mitigations  
Highlight technical, business, and operational risks.

### 12. Dependencies  
Tech stack, third‑party tools, AI model dependencies, AWS components.

### 13. Release Plan  
Agile-based, including milestones, sprints, and backlog structure.

---

## Output Format  
Generate the PRD as **clean, well‑structured Markdown**, ready for architecture diagram creation and developer handoff.

