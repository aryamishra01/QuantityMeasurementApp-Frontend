// Tab switching
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

// Check if elements exist before attaching events (This prevents silent failures)
if (loginTab && signupTab && loginForm && signupForm) {
    
    loginTab.onclick = () => {
        loginForm.classList.remove("hidden");
        signupForm.classList.add("hidden");
        loginTab.classList.add("active");
        signupTab.classList.remove("active");
    };

    signupTab.onclick = () => {
        signupForm.classList.remove("hidden");
        loginForm.classList.add("hidden");
        signupTab.classList.add("active");
        loginTab.classList.remove("active");
    };

} else {
    console.error("One or more tab elements were not found in the DOM!");
} 

// simple message helper
function setMessage(id, msg, isError=true){
  const el = document.getElementById(id);
  if(!el) { if(!isError) console.log(msg); else console.warn(msg); return; }
  el.textContent = msg;
  el.style.color = isError ? '#b91c1c' : '#16a34a';
}

// show/hide password buttons
document.querySelectorAll('.show-pass').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-target');
    const input = document.getElementById(target);
    if(!input) return;
    if(input.type === 'password'){ input.type = 'text'; btn.textContent = 'Hide'; }
    else { input.type = 'password'; btn.textContent = 'Show'; }
  });
});

// animate / focus behavior for password rows
document.querySelectorAll('.password-row input').forEach(inp => {
  const parent = inp.closest('.password-row');
  if(!parent) return;
  inp.addEventListener('focus', () => parent.classList.add('focused'));
  inp.addEventListener('blur', () => parent.classList.remove('focused'));
});

// Login logic
// Login logic with JSON Server
loginForm.onsubmit = async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    // 1. Ask the database if a user matches this email AND password
    const response = await fetch(`http://localhost:3000/users?email=${email}&password=${password}`);
    const matchedUsers = await response.json();

    // 2. Check the results
    if (matchedUsers.length > 0) {
      setMessage('loginMessage','Login successful!', false);
      // Save minimal session data so the Dashboard knows who is logged in
      localStorage.setItem("loggedInUser", JSON.stringify(matchedUsers[0]));
      // Redirect to your Dashboard page
      setTimeout(()=> window.location.href = 'DashBoard.html', 700);
    } else {
      setMessage('loginMessage','Invalid email or password!');
    }
  } catch (error) {
    console.error("Error logging in:", error);
    setMessage('loginMessage','Server error! Make sure json-server is running.');
  }
};
// Signup logic with JSON Server
signupForm.onsubmit = async (e) => {
  e.preventDefault();

  const user = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    mobile: document.getElementById("mobile").value
  };

  try {
    // 1. Check if the email is already registered
    const checkResponse = await fetch(`http://localhost:3000/users?email=${user.email}`);
    const existingUsers = await checkResponse.json();

    if (existingUsers.length > 0) {
      setMessage('signupMessage','This email is already registered! Please login.');
      return; // Stop the function here
    }

    // 2. If email is new, POST the new user to the database
    const response = await fetch('http://localhost:3000/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    });

    if (response.ok) {
      setMessage('signupMessage','Signup successful! Please login.', false);
      signupForm.reset(); // Clear the input fields
      loginTab.click();   // Automatically switch to the Login tab
    }
  } catch (error) {
    console.error("Error signing up:", error);
    setMessage('signupMessage','Server error! Make sure json-server is running.');
  }
};