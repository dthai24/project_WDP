\# Project Learning Path - WDP301

Tech Stack: React (Frontend), Node.js/Express (Backend), MongoDB (Mongoose).

Database Schema (ERD):

\- Users (user\_id, role, xp, streak)

\- Paths (path\_id, mentor\_id, title)

\- Nodes (node\_id, path\_id, type)

\- Quizzes (quiz\_id, node\_id)

\- Enrollments (student\_id, path\_id, status)

\- Enrollments \& Progress Management.



Coding Convention:

\- MVC Architecture (Model - View - Controller).

\- Controller chỉ nhận request, gọi Service/Model, trả về response.

\- React components: Functional components, dùng Hooks (useState, useEffect).

\- Tên file: kebab-case.

\- Mọi logic phải sạch, dễ đọc.

