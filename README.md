# Easy Learning Platform Server Site

## Project Overview:

We propose the creation of a feature-rich website and a corresponding Android app, leveraging state-of-the-art technologies:
Website: ReactJS, NodeJS, ExpressJS, MongoDB, TailwindCSS, JWT
App: Flutter, Restful API

## Key Features:

## For Bank Job Preparation:

### Coaching: Comprehensive modules covering Preliminary and Written exams.

Study Materials: Extensive resources, including hard and soft copies of coaching books for Preliminary and Written exams.

### Video Lectures: Engaging video content for both Preliminary and Written exams.

Quiz/Practice Test: A subscription-based system allowing users to access quizzes and practice tests for a nominal fee of 50 taka.

## For Primary/Parliament/Relevant Exam Preparation:

### Coaching: Tailored coaching modules.

Study Materials: In-depth study materials, featuring hard and soft copies of coaching books.

### Video Lectures: High-quality video lectures for Preliminary and Written exams.

Quiz/Practice Test: Similar to the Bank Job Preparation section, users can subscribe for 50 taka to access quizzes and practice tests.

### Security Measures:

To address concerns about content security, our solution will implement robust measures, including disabling screen recording, and phone number display randomly, ensuring the protection of video lectures and study materials from unauthorized downloading and copyright infringement.

# Routes:

## Category:

- /categories -> create categories (POST method) (ADMIN, SUPER ADMIN ROUTE)
- - input(form data):
- - - data:
      {
      "title": "Bank"
      }
- - - file: image upload

- /categories -> get all categories (GET method) (all user route)
- /categories/:id => get category details (GET method) (all user route)
- /categories/:id update a category (PATCH method) (ADMIN/SUPER ADMIN ROUTE)
- /categories/:id delete a category (DELETE method) (ADMIN/SUPER ADMIN ROUTE)

## Sub-Category:

- /sub-categories -> create sub-categories (POST method) (ADMIN, SUPER ADMIN ROUTE)
- - input(form data):
- - - data:
      {
      "title": "Preliminary",
      "category_id: "6586947b752bc90c6f91efb0"
      }
- - - file: image upload

- /sub-categories -> get all sub-categories (GET method) (all user route)
- /sub-categories/:id => get sub-category details (GET method) (all user route)
- /sub-categories/:id update a sub-category (PATCH method) (ADMIN/SUPER ADMIN ROUTE)
- /sub-categories/:id delete a sub-category (DELETE method) (ADMIN/SUPER ADMIN ROUTE)

## Course:

- /courses -> create courses (POST method) (ADMIN, SUPER ADMIN ROUTE)
- - input(form data):
- - - data:
      {
      "title": "Advanced English",<br>
      "author":"Sahara Banu",<br>
      "membership_type": "1",<br>
      "sub_category_id": "658694ab752bc90c6f91efb9", <br>
      "description": "This will cover all Advanced English required for BCS written. Enroll and be the boss in english. If you enroll in this course, you will be able to crack IELTS, TOEFL, GRE english also."
      }
- - - file: image upload for course banner

- /courses -> get all courses (GET method) (all user route)
- /courses/:id => get course details (GET method) (all user route)
- /courses/:id update a course (PATCH method) (ADMIN/SUPER ADMIN ROUTE)
- /courses/:id delete a course (DELETE method) (ADMIN/SUPER ADMIN ROUTE)

Copyright © Elite Developer Unity | Shah Jalal. All rights reserved.
