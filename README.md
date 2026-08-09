# Skill Scout

Build a complete production-ready full-stack web application called:

"Skill Gap Analysis System"

Subtitle: "Identifying Employee Skill Gaps for Organizational Development"

IMPORTANT:

This is an academic B.Tech project based on a project synopsis. The application must follow the requirements below closely.

TECHNOLOGY REQUIREMENT:

Use the MERN stack:

- Frontend: React.js

- Backend: Node.js + Express.js

- Database: MongoDB with Mongoose

- Authentication: JWT + bcrypt

- API communication: Axios

- Charts: Chart.js / Recharts

- Styling: Modern CSS / CSS modules

- Icons: Lucide React or another professional icon library

DO NOT use Supabase, Firebase, PostgreSQL, or any other database instead of MongoDB.

The frontend and backend should be logically separated:

- /frontend

- /backend

The application should be responsive and work properly on desktop, tablet and mobile.

==================================================

1. PROJECT PURPOSE

==================================================

The purpose of this system is to help organizations identify employee skill gaps by comparing:

Required Skill Level for a Job Role

        VS

Actual Employee Skill Level

The system should automatically calculate the skill gap and present the results through dashboards, charts and reports.

The system should help HR:

- Identify employee skill gaps

- Identify department/team capability gaps

- Determine training requirements

- Support promotion decisions

- Support workforce planning

- Support succession planning

- Recommend relevant training

- Generate management reports

The application should replace manual spreadsheet-based skill tracking with a centralized, automated and visual system.

==================================================

2. USER ROLES

==================================================

Implement three main roles:

1. ADMIN / HR

2. MANAGER

3. EMPLOYEE

Use role-based authentication and authorization.

------------------------------------------

ADMIN / HR

------------------------------------------

HR/Admin should be able to:

- Login

- View organization dashboard

- Create, edit and delete employees

- Create and manage departments

- Create and manage job roles

- Create and manage skills

- Define required proficiency levels for each skill and role

- View employee assessments

- Validate employee assessments

- Override employee/manager assessment scores

- View individual skill gaps

- View team-level skill gaps

- View department-level skill gaps

- View organization-wide skill gaps

- View heatmaps

- View training requirements

- Manage training recommendations

- Generate PDF reports

- Export Excel/CSV reports

- Filter reports by employee, department, role and skill

- View critical skill gaps

- Manage users

------------------------------------------

MANAGER

------------------------------------------

Manager should be able to:

- Login

- View assigned team

- View employee profiles

- Review employee self-assessments

- Give manager assessments

- Modify/validate assessment scores

- View employee skill gaps

- View team skill-gap dashboard

- Identify employees requiring training

- View recommended training

- Generate team reports

Managers should NOT have access to unrestricted organization-wide administrative functions.

------------------------------------------

EMPLOYEE

------------------------------------------

Employee should be able to:

- Login

- View personal dashboard

- View profile

- View assigned job role

- View required skills

- Complete self-assessment

- Rate skills from 1 to 5

- Submit assessment

- View assessment history

- View validated skill levels

- View personal skill gaps

- View recommended training

- View personal development progress

Employees must not be able to modify their required skill levels or manager assessments.

==================================================

3. PROFICIENCY SYSTEM

==================================================

Use a 1–5 proficiency scale.

The default universal proficiency rubric should be:

Level 1 = Awareness

Basic awareness of the skill and its terminology.

Level 2 = Basic

Can perform simple tasks with guidance.

Level 3 = Independent

Can independently perform normal tasks using the skill.

Level 4 = Advanced

Can handle complex tasks and solve problems independently.

Level 5 = Expert / Mentor

Has expert-level knowledge and can guide or mentor others.

Make the proficiency rubric configurable from the HR/Admin panel.

==================================================

4. SKILL GAP CALCULATION

==================================================

For every employee and skill:

Skill Gap = Required Skill Level - Actual Skill Level

Actual Skill Level should be based on the validated assessment.

The system should support:

Employee Self Assessment

+

Manager Assessment

The manager/HR assessment should be treated as the validated/actual score where available.

Example:

Required Level = 4

Employee Self Rating = 2

Manager Rating = 3

Actual Level = 3

Skill Gap = 4 - 3 = 1

Display:

Required: 4

Actual: 3

Gap: 1

Status: Monitor

==================================================

5. CRITICALITY / TRAFFIC LIGHT LOGIC

==================================================

Implement exactly this logic:

Gap >= 2

= RED

= Urgent Training

Gap = 1

= YELLOW

= Monitor

Gap = 0

= GREEN

= No Action

Do not allow negative gaps to appear as skill deficiencies.

If:

Required = 3

Actual = 4

Gap should be treated as 0 for criticality/action purposes because the employee already meets or exceeds the requirement.

However, optionally display:

"Requirement Met"

==================================================

6. DATABASE DESIGN

==================================================

Design a proper MongoDB schema using Mongoose.

Suggested collections:

Users

Employees

Departments

Roles

Skills

RoleSkills

Assessments

TrainingCourses

TrainingRecommendations

Reports

Relationships should be properly designed.

Example:

User

- name

- email

- password

- role

- employeeId

- departmentId

- status

Employee

- employeeId

- name

- email

- department

- jobRole

- manager

- joiningDate

- profileImage

Department

- name

- description

- manager

Role

- name

- department

- description

- requiredSkills

Skill

- name

- category

- description

- proficiencyLevels

RoleSkill

- roleId

- skillId

- requiredLevel

Assessment

- employeeId

- skillId

- selfRating

- managerRating

- validatedRating

- assessmentDate

- comments

- assessedBy

TrainingCourse

- title

- skill

- platform

- cost

- duration

- level

- courseUrl

TrainingRecommendation

- employeeId

- skillId

- gapLevel

- recommendedCourses

Use MongoDB ObjectIds and proper references.

==================================================

7. ADMIN / HR DASHBOARD

==================================================

Create a professional HR dashboard.

Dashboard should show:

- Total Employees

- Total Departments

- Total Job Roles

- Total Skills

- Employees Requiring Training

- Critical Skill Gaps

- Average Organization Skill Gap

- Training Requirements

Add charts:

1. Skill Gap by Department

2. Skill Gap by Job Role

3. Gap Distribution

4. Red / Yellow / Green distribution

5. Top 10 Skill Gaps

6. Employees requiring urgent training

Use interactive charts.

Allow filtering by:

- Department

- Role

- Skill

- Employee

- Gap status

==================================================

8. SKILL GAP HEATMAP

==================================================

Create a professional heatmap.

Rows:

Employees

Columns:

Skills

Cell:

Skill gap status

Color/status:

RED = Gap >= 2

YELLOW = Gap = 1

GREEN = Gap = 0

Hovering over a cell should display:

Employee

Skill

Required Level

Actual Level

Gap

Status

Also create department-level and team-level heatmaps.

==================================================

9. EMPLOYEE DASHBOARD

==================================================

Employee dashboard should contain:

Welcome section

Profile summary:

- Name

- Employee ID

- Department

- Job Role

Skill Overview:

Skill | Required | Self Rating | Manager Rating | Actual | Gap | Status

Use progress bars or cards to make the information visually understandable.

Add:

"My Skill Gaps"

"My Strengths"

"Recommended Training"

"Assessment History"

"Development Progress"

==================================================

10. ASSESSMENT MODULE

==================================================

Create an employee self-assessment form.

Display skills grouped by category.

Example:

Technical Skills

- JavaScript

- React

- Node.js

- MongoDB

Soft Skills

- Communication

- Leadership

- Teamwork

- Problem Solving

Each skill should have:

1  2  3  4  5

radio buttons or selectable cards.

Display the proficiency description when the employee selects a level.

Allow comments.

Add:

Save Draft

Submit Assessment

After submission, the assessment should become available to the manager.

==================================================

11. MANAGER ASSESSMENT

==================================================

Managers should see:

Employee Name

Job Role

Skill

Required Level

Employee Self Rating

Manager Rating

Manager can select:

1–5

and add comments.

After submission:

Actual Level = Manager Rating

The system should recalculate the skill gap automatically.

HR/Admin should have the ability to override the validated score when necessary.

==================================================

12. TRAINING RECOMMENDATION ENGINE

==================================================

Create a training recommendation system.

Example:

If:

Skill = Python

Gap = 2

Recommend:

Course:

Python Programming Course

Platform:

Udemy

Duration:

100 Days

Cost:

₹XXX

The recommendation should be based on:

Skill

+

Gap Level

Create a Training Recommendation Management page where HR can:

- Add training

- Edit training

- Delete training

- Assign training to skills

- Define recommended gap levels

Employee dashboard should automatically display relevant recommendations.

==================================================

13. REPORTING

==================================================

Create a Reports section.

Allow HR/Managers to generate reports based on:

- Employee

- Department

- Role

- Skill

- Date

- Gap status

Reports should include:

Employee information

Role

Department

Required skills

Actual skills

Skill gaps

Gap status

Training recommendations

Implement:

Export PDF

Export Excel

Export CSV

Create professional report layouts.

==================================================

14. EMPLOYEE MANAGEMENT

==================================================

HR should have an employee management table.

Columns:

Employee ID

Name

Email

Department

Role

Manager

Skill Gap Status

Actions

Actions:

View

Edit

Assessment

Skill Gaps

Training

Deactivate

Include:

Search

Sorting

Filtering

Pagination

==================================================

15. ROLE MANAGEMENT

==================================================

HR should be able to create job roles.

Example roles:

- Software Developer

- Digital Marketer

- Financial Analyst

- Healthcare Operations Executive

- HR Generalist

Each role should have multiple required skills.

HR can assign:

Skill

Required Proficiency Level

Example:

Software Developer

JavaScript → 4

React → 4

Node.js → 4

MongoDB → 3

Communication → 3

Problem Solving → 4

==================================================

16. SKILL MANAGEMENT

==================================================

Create a Skill Master module.

Each skill should contain:

- Skill name

- Category

- Description

- Proficiency definition

- Active/inactive status

Categories:

Technical

Soft Skill

Management

Domain

Make this configurable.

==================================================

17. AUTHENTICATION

==================================================

Implement secure authentication.

Requirements:

- Login

- Logout

- JWT authentication

- bcrypt password hashing

- Role-based authorization

- Protected routes

- Token expiration

- Proper error handling

Do not store plain-text passwords.

Create:

/login

/register if required

/logout

/profile

Backend middleware should verify JWT and user role.

==================================================

18. UI / UX DESIGN

==================================================

The UI should look like a modern professional HR SaaS product.

Design requirements:

- Clean

- Minimal

- Professional

- Corporate

- Modern

- Responsive

- Easy to understand

Use a dashboard layout with:

Sidebar

Top navigation

Main content area

Cards

Tables

Charts

Modals

Forms

Use a professional neutral color palette with clear status colors:

Red = Critical

Yellow = Warning

Green = Good

Do not make the UI overly colorful.

Use subtle shadows, rounded cards and proper spacing.

Use Lucide icons.

Create:

- Login page

- HR dashboard

- Manager dashboard

- Employee dashboard

- Employee management

- Department management

- Role management

- Skill management

- Assessment pages

- Skill-gap analysis

- Heatmap

- Training recommendations

- Reports

- Profile

- Settings

==================================================

19. RESPONSIVENESS

==================================================

The application must be fully responsive.

Desktop:

Sidebar + dashboard

Tablet:

Collapsible sidebar

Mobile:

Bottom navigation or collapsible sidebar

Tables should become horizontally scrollable or transform into responsive cards.

==================================================

20. API ARCHITECTURE

==================================================

Create REST APIs using Express.

Suggested API structure:

/api/auth

/api/users

/api/employees

/api/departments

/api/roles

/api/skills

/api/assessments

/api/skill-gaps

/api/training

/api/reports

/api/dashboard

Use:

Controllers

Routes

Models

Middleware

Services

Utils

Keep the backend modular and maintainable.

==================================================

21. ERROR HANDLING & VALIDATION

==================================================

Implement:

- Form validation

- API validation

- Proper HTTP status codes

- Centralized error handling

- Loading states

- Empty states

- Error states

- Success notifications

Show user-friendly messages.

Do not expose sensitive backend errors to users.

==================================================

22. SAMPLE DATA

==================================================

Create realistic seed/mock data for development.

Create:

5 job roles

8 skills per role

15 dummy employees

5 departments

Sample self-assessments

Sample manager assessments

Sample training courses

Use fictional data only.

The 15 employees should be distributed across the 5 departments.

Use different skill ratings so that the dashboard demonstrates:

- Red gaps

- Yellow gaps

- Green/no-gap cases

This is important because the final dashboard must demonstrate the project's skill-gap analysis functionality.

==================================================

23. SAMPLE JOB ROLES

==================================================

Use these as initial sample roles:

1. Software Developer

2. Digital Marketer

3. Healthcare Operations Executive

4. Financial Analyst

5. HR Generalist

Each role should contain a mixture of:

Technical/Hard Skills

+

Soft Skills

HR/Admin must be able to modify these later.

==================================================

24. SECURITY

==================================================

Implement basic application security:

- Password hashing

- JWT authentication

- Role-based access control

- Input validation

- MongoDB query protection

- CORS configuration

- Environment variables

- Do not expose secrets in frontend

- Do not hardcode MongoDB credentials

- Use .env files

Example:

MONGODB_URI=

JWT_SECRET=

PORT=

Create a .env.example file.

==================================================

25. PROJECT STRUCTURE

==================================================

Use a clean structure similar to:

project-root/

frontend/

    src/

        components/

        pages/

        layouts/

        hooks/

        services/

        context/

        utils/

        charts/

        assets/

backend/

    controllers/

    models/

    routes/

    middleware/

    services/

    utils/

    config/

    seed/

    server.js

README.md

.env.example

==================================================

26. IMPORTANT CALCULATION EXAMPLE

==================================================

The application must correctly calculate:

Required Level = 4

Actual Level = 2

Gap = 2

Status = RED

Action = Urgent Training

Another example:

Required = 4

Actual = 3

Gap = 1

Status = YELLOW

Action = Monitor

Another example:

Required = 4

Actual = 4

Gap = 0

Status = GREEN

Action = No Action

Another example:

Required = 3

Actual = 4

Gap = 0 for action classification

Status = GREEN

Message = Requirement Met

==================================================

27. DASHBOARD ANALYTICS

==================================================

Calculate real analytics from MongoDB data.

Do NOT hardcode dashboard numbers.

Examples:

Total Employees

=

count(Employee)

Average Skill Gap

=

calculated from actual assessment data

Department Skill Gap

=

aggregated from assessments

Red Gap Count

=

number of skill assessments where gap >= 2

Yellow Gap Count

=

number where gap = 1

Green Count

=

number where gap = 0

Charts must update when filters change.

==================================================

28. PROJECT WORKFLOW

==================================================

The complete workflow should be:

HR creates Role

        ↓

HR assigns Required Skills

        ↓

Employee is assigned Role

        ↓

Employee logs in

        ↓

Employee completes Self Assessment

        ↓

Manager reviews Self Assessment

        ↓

Manager gives Assessment

        ↓

System determines Actual Skill Level

        ↓

Skill Gap Engine calculates gap

        ↓

System determines Red/Yellow/Green status

        ↓

Dashboard displays results

        ↓

Training Recommendation Engine recommends courses

        ↓

HR/Manager reviews results

        ↓

Reports are generated

==================================================

29. ACADEMIC PROJECT REQUIREMENT

==================================================

This is a B.Tech academic project.

The system should be sufficiently complete to demonstrate:

- Software engineering

- Full-stack development

- Database management

- Authentication

- REST APIs

- Role-based access

- Data analytics

- HR domain application

- Visualization

- Automated business logic

- Reporting

The application should not look like a generic CRUD project.

The skill-gap calculation and HR analytics must be the core functionality.

==================================================

30. DEVELOPMENT APPROACH

==================================================

Build the project in a modular manner.

First implement:

1. Project setup

2. MongoDB connection

3. Authentication

4. User roles

5. Employee management

6. Department management

7. Role management

8. Skill management

9. Assessment module

10. Skill-gap calculation

11. Dashboards

12. Training recommendations

13. Reports

14. Testing

15. Final UI polish

Before considering the project complete, verify that the complete workflow works from:

HR → Role → Skills → Employee → Self Assessment → Manager Assessment → Gap Calculation → Dashboard → Training Recommendation → Report.

==================================================

31. FINAL REQUIREMENT

==================================================

Do not create only static frontend screens.

All major features must be connected to the backend and MongoDB.

The following must be functional:

- Authentication

- CRUD operations

- Assessments

- Skill-gap calculations

- Dashboard analytics

- Heatmaps

- Training recommendations

- Filtering

- Reports

- Role-based access

Use realistic sample data so the application is immediately demonstrable.

Create a polished, professional, responsive application suitable for a B.Tech final-year project demonstration.

At the end, provide clear instructions for:

1. Installing dependencies

2. Setting environment variables

3. Connecting MongoDB Atlas

4. Running backend

5. Running frontend

6. Seeding sample data

7. Creating the first HR/Admin account

8. Testing the complete workflowBuild a complete production-ready full-stack web application called:

"Skill Gap Analysis System"

Subtitle: "Identifying Employee Skill Gaps for Organizational Development"

IMPORTANT:

This is an academic B.Tech project based on a project synopsis. The application must follow the requirements below closely.

TECHNOLOGY REQUIREMENT:

Use the MERN stack:

- Frontend: React.js

- Backend: Node.js + Express.js

- Database: MongoDB with Mongoose

- Authentication: JWT + bcrypt

- API communication: Axios

- Charts: Chart.js / Recharts

- Styling: Modern CSS / CSS modules

- Icons: Lucide React or another professional icon library

DO NOT use Supabase, Firebase, PostgreSQL, or any other database instead of MongoDB.

The frontend and backend should be logically separated:

- /frontend

- /backend

The application should be responsive and work properly on desktop, tablet and mobile.

==================================================

1. PROJECT PURPOSE

==================================================

The purpose of this system is to help organizations identify employee skill gaps by comparing:

Required Skill Level for a Job Role

        VS

Actual Employee Skill Level

The system should automatically calculate the skill gap and present the results through dashboards, charts and reports.

The system should help HR:

- Identify employee skill gaps

- Identify department/team capability gaps

- Determine training requirements

- Support promotion decisions

- Support workforce planning

- Support succession planning

- Recommend relevant training

- Generate management reports

The application should replace manual spreadsheet-based skill tracking with a centralized, automated and visual system.

==================================================

2. USER ROLES

==================================================

Implement three main roles:

1. ADMIN / HR

2. MANAGER

3. EMPLOYEE

Use role-based authentication and authorization.

------------------------------------------

ADMIN / HR

------------------------------------------

HR/Admin should be able to:

- Login

- View organization dashboard

- Create, edit and delete employees

- Create and manage departments

- Create and manage job roles

- Create and manage skills

- Define required proficiency levels for each skill and role

- View employee assessments

- Validate employee assessments

- Override employee/manager assessment scores

- View individual skill gaps

- View team-level skill gaps

- View department-level skill gaps

- View organization-wide skill gaps

- View heatmaps

- View training requirements

- Manage training recommendations

- Generate PDF reports

- Export Excel/CSV reports

- Filter reports by employee, department, role and skill

- View critical skill gaps

- Manage users

------------------------------------------

MANAGER

------------------------------------------

Manager should be able to:

- Login

- View assigned team

- View employee profiles

- Review employee self-assessments

- Give manager assessments

- Modify/validate assessment scores

- View employee skill gaps

- View team skill-gap dashboard

- Identify employees requiring training

- View recommended training

- Generate team reports

Managers should NOT have access to unrestricted organization-wide administrative functions.

------------------------------------------

EMPLOYEE

------------------------------------------

Employee should be able to:

- Login

- View personal dashboard

- View profile

- View assigned job role

- View required skills

- Complete self-assessment

- Rate skills from 1 to 5

- Submit assessment

- View assessment history

- View validated skill levels

- View personal skill gaps

- View recommended training

- View personal development progress

Employees must not be able to modify their required skill levels or manager assessments.

==================================================

3. PROFICIENCY SYSTEM

==================================================

Use a 1–5 proficiency scale.

The default universal proficiency rubric should be:

Level 1 = Awareness

Basic awareness of the skill and its terminology.

Level 2 = Basic

Can perform simple tasks with guidance.

Level 3 = Independent

Can independently perform normal tasks using the skill.

Level 4 = Advanced

Can handle complex tasks and solve problems independently.

Level 5 = Expert / Mentor

Has expert-level knowledge and can guide or mentor others.

Make the proficiency rubric configurable from the HR/Admin panel.

==================================================

4. SKILL GAP CALCULATION

==================================================

For every employee and skill:

Skill Gap = Required Skill Level - Actual Skill Level

Actual Skill Level should be based on the validated assessment.

The system should support:

Employee Self Assessment

+

Manager Assessment

The manager/HR assessment should be treated as the validated/actual score where available.

Example:

Required Level = 4

Employee Self Rating = 2

Manager Rating = 3

Actual Level = 3

Skill Gap = 4 - 3 = 1

Display:

Required: 4

Actual: 3

Gap: 1

Status: Monitor

==================================================

5. CRITICALITY / TRAFFIC LIGHT LOGIC

==================================================

Implement exactly this logic:

Gap >= 2

= RED

= Urgent Training

Gap = 1

= YELLOW

= Monitor

Gap = 0

= GREEN

= No Action

Do not allow negative gaps to appear as skill deficiencies.

If:

Required = 3

Actual = 4

Gap should be treated as 0 for criticality/action purposes because the employee already meets or exceeds the requirement.

However, optionally display:

"Requirement Met"

==================================================

6. DATABASE DESIGN

==================================================

Design a proper MongoDB schema using Mongoose.

Suggested collections:

Users

Employees

Departments

Roles

Skills

RoleSkills

Assessments

TrainingCourses

TrainingRecommendations

Reports

Relationships should be properly designed.

Example:

User

- name

- email

- password

- role

- employeeId

- departmentId

- status

Employee

- employeeId

- name

- email

- department

- jobRole

- manager

- joiningDate

- profileImage

Department

- name

- description

- manager

Role

- name

- department

- description

- requiredSkills

Skill

- name

- category

- description

- proficiencyLevels

RoleSkill

- roleId

- skillId

- requiredLevel

Assessment

- employeeId

- skillId

- selfRating

- managerRating

- validatedRating

- assessmentDate

- comments

- assessedBy

TrainingCourse

- title

- skill

- platform

- cost

- duration

- level

- courseUrl

TrainingRecommendation

- employeeId

- skillId

- gapLevel

- recommendedCourses

Use MongoDB ObjectIds and proper references.

==================================================

7. ADMIN / HR DASHBOARD

==================================================

Create a professional HR dashboard.

Dashboard should show:

- Total Employees

- Total Departments

- Total Job Roles

- Total Skills

- Employees Requiring Training

- Critical Skill Gaps

- Average Organization Skill Gap

- Training Requirements

Add charts:

1. Skill Gap by Department

2. Skill Gap by Job Role

3. Gap Distribution

4. Red / Yellow / Green distribution

5. Top 10 Skill Gaps

6. Employees requiring urgent training

Use interactive charts.

Allow filtering by:

- Department

- Role

- Skill

- Employee

- Gap status

==================================================

8. SKILL GAP HEATMAP

==================================================

Create a professional heatmap.

Rows:

Employees

Columns:

Skills

Cell:

Skill gap status

Color/status:

RED = Gap >= 2

YELLOW = Gap = 1

GREEN = Gap = 0

Hovering over a cell should display:

Employee

Skill

Required Level

Actual Level

Gap

Status

Also create department-level and team-level heatmaps.

==================================================

9. EMPLOYEE DASHBOARD

==================================================

Employee dashboard should contain:

Welcome section

Profile summary:

- Name

- Employee ID

- Department

- Job Role

Skill Overview:

Skill | Required | Self Rating | Manager Rating | Actual | Gap | Status

Use progress bars or cards to make the information visually understandable.

Add:

"My Skill Gaps"

"My Strengths"

"Recommended Training"

"Assessment History"

"Development Progress"

==================================================

10. ASSESSMENT MODULE

==================================================

Create an employee self-assessment form.

Display skills grouped by category.

Example:

Technical Skills

- JavaScript

- React

- Node.js

- MongoDB

Soft Skills

- Communication

- Leadership

- Teamwork

- Problem Solving

Each skill should have:

1  2  3  4  5

radio buttons or selectable cards.

Display the proficiency description when the employee selects a level.

Allow comments.

Add:

Save Draft

Submit Assessment

After submission, the assessment should become available to the manager.

==================================================

11. MANAGER ASSESSMENT

==================================================

Managers should see:

Employee Name

Job Role

Skill

Required Level

Employee Self Rating

Manager Rating

Manager can select:

1–5

and add comments.

After submission:

Actual Level = Manager Rating

The system should recalculate the skill gap automatically.

HR/Admin should have the ability to override the validated score when necessary.

==================================================

12. TRAINING RECOMMENDATION ENGINE

==================================================

Create a training recommendation system.

Example:

If:

Skill = Python

Gap = 2

Recommend:

Course:

Python Programming Course

Platform:

Udemy

Duration:

100 Days

Cost:

₹XXX

The recommendation should be based on:

Skill

+

Gap Level

Create a Training Recommendation Management page where HR can:

- Add training

- Edit training

- Delete training

- Assign training to skills

- Define recommended gap levels

Employee dashboard should automatically display relevant recommendations.

==================================================

13. REPORTING

==================================================

Create a Reports section.

Allow HR/Managers to generate reports based on:

- Employee

- Department

- Role

- Skill

- Date

- Gap status

Reports should include:

Employee information

Role

Department

Required skills

Actual skills

Skill gaps

Gap status

Training recommendations

Implement:

Export PDF

Export Excel

Export CSV

Create professional report layouts.

==================================================

14. EMPLOYEE MANAGEMENT

==================================================

HR should have an employee management table.

Columns:

Employee ID

Name

Email

Department

Role

Manager

Skill Gap Status

Actions

Actions:

View

Edit

Assessment

Skill Gaps

Training

Deactivate

Include:

Search

Sorting

Filtering

Pagination

==================================================

15. ROLE MANAGEMENT

==================================================

HR should be able to create job roles.

Example roles:

- Software Developer

- Digital Marketer

- Financial Analyst

- Healthcare Operations Executive

- HR Generalist

Each role should have multiple required skills.

HR can assign:

Skill

Required Proficiency Level

Example:

Software Developer

JavaScript → 4

React → 4

Node.js → 4

MongoDB → 3

Communication → 3

Problem Solving → 4

==================================================

16. SKILL MANAGEMENT

==================================================

Create a Skill Master module.

Each skill should contain:

- Skill name

- Category

- Description

- Proficiency definition

- Active/inactive status

Categories:

Technical

Soft Skill

Management

Domain

Make this configurable.

==================================================

17. AUTHENTICATION

==================================================

Implement secure authentication.

Requirements:

- Login

- Logout

- JWT authentication

- bcrypt password hashing

- Role-based authorization

- Protected routes

- Token expiration

- Proper error handling

Do not store plain-text passwords.

Create:

/login

/register if required

/logout

/profile

Backend middleware should verify JWT and user role.

==================================================

18. UI / UX DESIGN

==================================================

The UI should look like a modern professional HR SaaS product.

Design requirements:

- Clean

- Minimal

- Professional

- Corporate

- Modern

- Responsive

- Easy to understand

Use a dashboard layout with:

Sidebar

Top navigation

Main content area

Cards

Tables

Charts

Modals

Forms

Use a professional neutral color palette with clear status colors:

Red = Critical

Yellow = Warning

Green = Good

Do not make the UI overly colorful.

Use subtle shadows, rounded cards and proper spacing.

Use Lucide icons.

Create:

- Login page

- HR dashboard

- Manager dashboard

- Employee dashboard

- Employee management

- Department management

- Role management

- Skill management

- Assessment pages

- Skill-gap analysis

- Heatmap

- Training recommendations

- Reports

- Profile

- Settings

==================================================

19. RESPONSIVENESS

==================================================

The application must be fully responsive.

Desktop:

Sidebar + dashboard

Tablet:

Collapsible sidebar

Mobile:

Bottom navigation or collapsible sidebar

Tables should become horizontally scrollable or transform into responsive cards.

==================================================

20. API ARCHITECTURE

==================================================

Create REST APIs using Express.

Suggested API structure:

/api/auth

/api/users

/api/employees

/api/departments

/api/roles

/api/skills

/api/assessments

/api/skill-gaps

/api/training

/api/reports

/api/dashboard

Use:

Controllers

Routes

Models

Middleware

Services

Utils

Keep the backend modular and maintainable.

==================================================

21. ERROR HANDLING & VALIDATION

==================================================

Implement:

- Form validation

- API validation

- Proper HTTP status codes

- Centralized error handling

- Loading states

- Empty states

- Error states

- Success notifications

Show user-friendly messages.

Do not expose sensitive backend errors to users.

==================================================

22. SAMPLE DATA

==================================================

Create realistic seed/mock data for development.

Create:

5 job roles

8 skills per role

15 dummy employees

5 departments

Sample self-assessments

Sample manager assessments

Sample training courses

Use fictional data only.

The 15 employees should be distributed across the 5 departments.

Use different skill ratings so that the dashboard demonstrates:

- Red gaps

- Yellow gaps

- Green/no-gap cases

This is important because the final dashboard must demonstrate the project's skill-gap analysis functionality.

==================================================

23. SAMPLE JOB ROLES

==================================================

Use these as initial sample roles:

1. Software Developer

2. Digital Marketer

3. Healthcare Operations Executive

4. Financial Analyst

5. HR Generalist

Each role should contain a mixture of:

Technical/Hard Skills

+

Soft Skills

HR/Admin must be able to modify these later.

==================================================

24. SECURITY

==================================================

Implement basic application security:

- Password hashing

- JWT authentication

- Role-based access control

- Input validation

- MongoDB query protection

- CORS configuration

- Environment variables

- Do not expose secrets in frontend

- Do not hardcode MongoDB credentials

- Use .env files

Example:

MONGODB_URI=

JWT_SECRET=

PORT=

Create a .env.example file.

==================================================

25. PROJECT STRUCTURE

==================================================

Use a clean structure similar to:

project-root/

frontend/

    src/

        components/

        pages/

        layouts/

        hooks/

        services/

        context/

        utils/

        charts/

        assets/

backend/

    controllers/

    models/

    routes/

    middleware/

    services/

    utils/

    config/

    seed/

    server.js

README.md

.env.example

==================================================

26. IMPORTANT CALCULATION EXAMPLE

==================================================

The application must correctly calculate:

Required Level = 4

Actual Level = 2

Gap = 2

Status = RED

Action = Urgent Training

Another example:

Required = 4

Actual = 3

Gap = 1

Status = YELLOW

Action = Monitor

Another example:

Required = 4

Actual = 4

Gap = 0

Status = GREEN

Action = No Action

Another example:

Required = 3

Actual = 4

Gap = 0 for action classification

Status = GREEN

Message = Requirement Met

==================================================

27. DASHBOARD ANALYTICS

==================================================

Calculate real analytics from MongoDB data.

Do NOT hardcode dashboard numbers.

Examples:

Total Employees

=

count(Employee)

Average Skill Gap

=

calculated from actual assessment data

Department Skill Gap

=

aggregated from assessments

Red Gap Count

=

number of skill assessments where gap >= 2

Yellow Gap Count

=

number where gap = 1

Green Count

=

number where gap = 0

Charts must update when filters change.

==================================================

28. PROJECT WORKFLOW

==================================================

The complete workflow should be:

HR creates Role

        ↓

HR assigns Required Skills

        ↓

Employee is assigned Role

        ↓

Employee logs in

        ↓

Employee completes Self Assessment

        ↓

Manager reviews Self Assessment

        ↓

Manager gives Assessment

        ↓

System determines Actual Skill Level

        ↓

Skill Gap Engine calculates gap

        ↓

System determines Red/Yellow/Green status

        ↓

Dashboard displays results

        ↓

Training Recommendation Engine recommends courses

        ↓

HR/Manager reviews results

        ↓

Reports are generated

==================================================

29. ACADEMIC PROJECT REQUIREMENT

==================================================

This is a B.Tech academic project.

The system should be sufficiently complete to demonstrate:

- Software engineering

- Full-stack development

- Database management

- Authentication

- REST APIs

- Role-based access

- Data analytics

- HR domain application

- Visualization

- Automated business logic

- Reporting

The application should not look like a generic CRUD project.

The skill-gap calculation and HR analytics must be the core functionality.

==================================================

30. DEVELOPMENT APPROACH

==================================================

Build the project in a modular manner.

First implement:

1. Project setup

2. MongoDB connection

3. Authentication

4. User roles

5. Employee management

6. Department management

7. Role management

8. Skill management

9. Assessment module

10. Skill-gap calculation

11. Dashboards

12. Training recommendations

13. Reports

14. Testing

15. Final UI polish

Before considering the project complete, verify that the complete workflow works from:

HR → Role → Skills → Employee → Self Assessment → Manager Assessment → Gap Calculation → Dashboard → Training Recommendation → Report.

==================================================

31. FINAL REQUIREMENT

==================================================

Do not create only static frontend screens.

All major features must be connected to the backend and MongoDB.

The following must be functional:

- Authentication

- CRUD operations

- Assessments

- Skill-gap calculations

- Dashboard analytics

- Heatmaps

- Training recommendations

- Filtering

- Reports

- Role-based access

Use realistic sample data so the application is immediately demonstrable.

Create a polished, professional, responsive application suitable for a B.Tech final-year project demonstration.

At the end, provide clear instructions for:

1. Installing dependencies

2. Setting environment variables

3. Connecting MongoDB Atlas

4. Running backend

5. Running frontend

6. Seeding sample data

7. Creating the first HR/Admin account

8. Testing the complete workflow

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/99e38d68-0a1f-41b9-8912-4b7c5f46dd77).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
