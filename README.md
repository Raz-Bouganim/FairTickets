# FairTickets

FairTickets is a web application for managing event tickets. Users can sign up, log in, view upcoming events and manage their profiles.

## Features

- User authentication (sign up, log in)
- View upcoming events
- Manage user profile
- Transfer tickets to other users

## Technologies Used

- Flask (Python)
- SQLite
- HTML, CSS, JavaScript
- Bootstrap (optional)
- Font Awesome

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/Raz-Bouganim/FairTickets.git
    cd FairTickets
    ```

2. Create a virtual environment and activate it:
    ```sh
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    ```

3. Install the required dependencies:
    ```sh
    pip install -r requirements.txt
    ```

4. Run the Flask application:
    ```sh
    flask run
    ```

## Usage

1. Open your web browser and go to `http://127.0.0.1:5000/`.
2. Sign up for a new account or log in with an existing account.
3. Browse upcoming events and purchase tickets.
4. Manage your profile and view your purchase history.

## Existing Users for Testing

You can use the following credentials to test the functionality of the site:

- **User 1:**
  - Email: `annawhite@example.com`
  - Password: `Anna123!`

- **User 2:**
  - Email: `johndoe@example.com`
  - Password: `P@ssw0rd`

## Known Issues and Unfinished Parts

- You cannot add new events through the web interface; events must be added directly to the database.
- You cannot add new tickets through the web interface; tickets must be added directly to the database.
- You cannot buy tickets through the web.

## Project Purpose

This project was created as a training exercise to practice web development skills using Flask, SQLite, and front-end technologies.
