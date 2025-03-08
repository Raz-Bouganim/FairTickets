document.addEventListener('DOMContentLoaded', function() {
    let isLoggedIn = false;

    if (localStorage.getItem('isLoggedIn') === 'true') {
        isLoggedIn = true;
    }   

    // Event listener for login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const email = loginForm.querySelector('input[name="email"]').value;
            const password = loginForm.querySelector('input[name="password"]').value;

            const payload = {
                email: email,
                password: password
            };

            fetch('http://127.0.0.1:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    alert('Login successful!');
                    isLoggedIn = true;
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userEmail', email);
                    window.location.href = 'index.html';
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }

    // Event listener for signup form submission
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(event) {
            event.preventDefault();
            signupFormSubmit();
        });
    }

    function signupFormSubmit() {
        const email = signupForm.querySelector('input[name="email"]').value;
        const fullName = signupForm.querySelector('input[name="full-name"]').value;
        const password = signupForm.querySelector('input[name="password"]').value;
        const confirmPassword = signupForm.querySelector('input[name="confirm-password"]').value;

        /** Email validation
         * This pattern ensures that the email:
         * - Starts with one or more characters that are not whitespace or '@'.
         * - Followed by the '@' symbol.
         * - Followed by one or more characters that are not whitespace or '@'.
         * - Followed by a dot ('.').
         * - Ends with one or more characters that are not whitespace or '@'.
        */
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        // Full name validation
        const nameParts = fullName.trim().split(' ');
        if (nameParts.length < 2) {
            alert('Please enter at least two names.');
            return;
        }

        /** Password validation
         * The password must contain at least one lowercase letter, one uppercase letter,
         * one digit, and one special character from @$!%*?&. The minimum length is 6 characters.
         */
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        if (!passwordPattern.test(password)) {
            alert('Password must be at least 6 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character.');
            return;
        }

        // Confirm password validation
        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        const payload = {
            full_name: fullName,
            email: email,
            password: password
        };

        fetch('http://127.0.0.1:5000/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                alert('Sign up successful!');
                window.location.href = 'auth.html';
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    // Load events dynamically
    function loadEvents() {
        fetch('http://127.0.0.1:5000/events')
            .then(response => response.json())
            .then(events => {
                const eventList = document.getElementById('featured-events-list');
                if (eventList) {
                    events.forEach(event => {
                        const eventItem = document.createElement('article');
                        eventItem.classList.add('event');
                        eventItem.innerHTML = `
                            <h3>${event.name}</h3>
                            <p>${event.date} - ${event.location}</p>
                            <a href="event-details.html?id=${event.id}" class="btn">Get Tickets</a>
                        `;
                        eventList.appendChild(eventItem);
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    loadEvents();

    // Conditionally display the "Profile", "Transfer", and "Logout" options
    const authLink = document.getElementById('auth-link');
    const profileDropdownContent = document.getElementById('profile-dropdown-content');
    const profileLink = document.getElementById('profile-link');
    const transferLink = document.getElementById('transfer-link');
    const logoutLink = document.getElementById('logout-link');
    const profileDropdown = document.querySelector('.profile-dropdown');
    
    if (isLoggedIn) {
        if (authLink) authLink.href = "#";
        if (profileLink) profileLink.style.display = 'block';
        if (transferLink) transferLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'block';

        if (profileDropdown) {
            profileDropdown.addEventListener('mouseenter', function() {
                if (profileDropdownContent) profileDropdownContent.style.display = 'block';
            });
            profileDropdown.addEventListener('mouseleave', function() {
                if (profileDropdownContent) profileDropdownContent.style.display = 'none';
            });
        }
    } else {
        if (profileDropdownContent) profileDropdownContent.style.display = 'none';
    }

    // Switch between login and signup forms
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const loginBox = document.getElementById('login-box');
    const signupBox = document.getElementById('signup-box');

    if (showSignup) {
        showSignup.addEventListener('click', function(event) {
            event.preventDefault();
            loginBox.style.display = 'none';
            signupBox.style.display = 'block';
        });
    }

    if (showLogin) {
        showLogin.addEventListener('click', function(event) {
            event.preventDefault();
            signupBox.style.display = 'none';
            loginBox.style.display = 'block';
        });
    }

    // Logout script
    if (logoutLink) {
        logoutLink.addEventListener('click', function(event) {
            event.preventDefault();
            if (confirm('Are you sure you want to log out?')) {
                localStorage.removeItem('isLoggedIn'); 
                localStorage.removeItem('userEmail'); 
                window.location.href = 'index.html'; 
            }
        });
    }

    // Load profile information
    function loadProfileInfo() {
        const profileDetails = document.getElementById('profile-details');
        if (profileDetails) {
            const userEmail = localStorage.getItem('userEmail');
            if (userEmail) {
                fetch(`http://127.0.0.1:5000/profile?email=${userEmail}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.error) {
                            alert(data.error);
                        } else {
                            profileDetails.innerHTML = `
                                <p><strong>Full Name:</strong> ${data.full_name}</p>
                                <p><strong>Email:</strong> ${data.email}</p>
                            `;
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            }
        }
    }

    // Load upcoming events
    function loadUpcomingEvents() {
        const upcomingEventsList = document.getElementById('upcoming-events-list');
        if (upcomingEventsList) {
            const userEmail = localStorage.getItem('userEmail');
            if (userEmail) {
                upcomingEventsList.innerHTML = ''; 
                fetch(`http://127.0.0.1:5000/upcoming-events?email=${userEmail}`)
                    .then(response => response.json())
                    .then(events => {
                        events.forEach(event => {
                            const eventItem = document.createElement('div');
                            eventItem.classList.add('event-item');
                            eventItem.innerHTML = `
                                <h3>${event.name}</h3>
                                <p>${event.date} - ${event.location}</p>
                                <p><strong>Seat Info:</strong> ${event.seat_number}</p>
                                <p><strong>Ticket ID:</strong> ${event.ticket_id}</p>
                            `;
                            upcomingEventsList.appendChild(eventItem);
                        });
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            }
        }
    }

    // Load purchase history
    function loadPurchaseHistory() {
        const purchaseHistoryList = document.getElementById('purchase-history-list');
        if (purchaseHistoryList) {
            const userEmail = localStorage.getItem('userEmail');
            if (userEmail) {
                purchaseHistoryList.innerHTML = ''; 
                fetch(`http://127.0.0.1:5000/purchase-history?email=${userEmail}`)
                    .then(response => response.json())
                    .then(events => {
                        events.forEach(event => {
                            const eventItem = document.createElement('div');
                            eventItem.classList.add('event-item');
                            eventItem.innerHTML = `
                                <h3>${event.name}</h3>
                                <p>${event.date} - ${event.location}</p>
                                <p><strong>Seat Info:</strong> ${event.seat_number}</p>
                                <p><strong>Ticket ID:</strong> ${event.ticket_id}</p>
                            `;
                            purchaseHistoryList.appendChild(eventItem);
                        });
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            }
        }
    }

    // Load upcoming tickets for transfer
    function loadUpcomingTickets() {
        const upcomingTicketsList = document.getElementById('upcoming-tickets-list');
        if (upcomingTicketsList) {
            const userEmail = localStorage.getItem('userEmail');
            if (userEmail) {
                upcomingTicketsList.innerHTML = ''; 
                fetch(`http://127.0.0.1:5000/upcoming-events?email=${userEmail}`)
                    .then(response => response.json())
                    .then(events => {
                        events.forEach(event => {
                            const eventItem = document.createElement('div');
                            eventItem.classList.add('event-item');
                            eventItem.innerHTML = `
                                <h3>${event.name}</h3>
                                <p>${event.date} - ${event.location}</p>
                                <p><strong>Seat Info:</strong> ${event.seat_number}</p>
                                <p><strong>Ticket ID:</strong> ${event.ticket_id}</p>
                                <form class="transfer-form" data-ticket-id="${event.ticket_id}">
                                    <input type="email" placeholder="Recipient's email" required>
                                    <button type="submit" class="btn">Transfer</button>
                                </form>
                            `;
                            upcomingTicketsList.appendChild(eventItem);
                        });

                        // Add event listeners to transfer forms
                        const transferForms = document.querySelectorAll('.transfer-form');
                        transferForms.forEach(form => {
                            form.addEventListener('submit', function(event) {
                                event.preventDefault();
                                const ticketId = form.getAttribute('data-ticket-id');
                                const recipientEmail = form.querySelector('input[type="email"]').value;
                                transferTicket(ticketId, recipientEmail);
                            });
                        });
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            }
        }
    }

    // Transfer a ticket
    function transferTicket(ticketId, recipientEmail) {
        const payload = {
            ticket_id: ticketId,
            recipient_email: recipientEmail
        };

        fetch('http://127.0.0.1:5000/transfer-ticket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                alert('Ticket transferred successfully!');
                loadUpcomingTickets(); 
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    // Load profile info, upcoming events, and purchase history if on profile page
    if (document.body.contains(document.getElementById('profile-details'))) {
        loadProfileInfo();
        loadUpcomingEvents();
        loadPurchaseHistory();
    }

    // Load upcoming tickets if on transfer page
    if (document.body.contains(document.getElementById('upcoming-tickets-list'))) {
        loadUpcomingTickets();
    }
});