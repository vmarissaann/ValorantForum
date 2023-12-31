//opens up pop-up
const formOpenBtn = document.querySelector("#form-open"),
home = document.querySelector(".home"),

//comtains form content for login or signup
formContainer = document.querySelector(".form-container");

//closes form
formCloseBtn = document.querySelector(".form-close");

//buttons for transferring between signup and login
signUpBtn = document.querySelector("#signup");
loginBtn = document.querySelector("#login");

//buttons for submission of username and password in login/ sign-up
submitSignBtn = document.querySelector("#sign-submit");
submitLogBtn=document.querySelector("#log-submit");
const loginForm=document.forms.loginForm;
const signForm=document.forms.signForm;


//retrieves log out button
logoutBtn=document.querySelector(".logout");
//retrieves username + pfp in navbar
accountBtn=document.querySelector(".user-profile");

let cantAuth = document.querySelector(".nav-menu-logo").getAttribute("data-not-auth");

// Allows user to log in
submitLogBtn?.addEventListener("click",async(e)=>{
    e.preventDefault();
    const loginData=new FormData(loginForm);
    //console.log(loginData.get("logUsername"),loginData.get("logPassword"));

    const  user={
        username:"@"+loginData.get("logUsername"),
        password:loginData.get("logPassword"),
    };

    const jUser=JSON.stringify(user);
    console.log(jUser);
    
    //retrieves div for displaying error message
    let errormsg=document.getElementById("login-error-msg");

    //retrieves username in nav bar
    let nav_un=document.querySelector(".nav-username");

    //retrievves profile href in navbar
    let nav_profile = $('#profile-link');
    //console.log("nav before ",nav_profile.attr('href'));

    try {
        const response = await fetch("/login", {
          method: 'POST',
          body: jUser,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if(response.status==200){
            errormsg.textContent="";
            home.classList.remove("show");
            //accountBtn.classList.remove("hidden");
            formOpenBtn.classList.add("hidden");
            // nav_un.textContent=loginData.get("logUsername");
            // nav_profile.attr('href', `/profile/@${loginData.get("logUsername")}`);
            location.reload();
            //console.log("nav after: ", nav_profile.attr('href'));
        }
        else{
            console.log("Status code received: ", response.status);
            errormsg.textContent="Invalid username or password";
        }
      } catch (err) {
        console.error('Error occurred:', err);
      }

      
});

// Allows user to create an account
submitSignBtn?.addEventListener("click", async(e)=>{
    e.preventDefault();
    const signData=new FormData(signForm);

    // Check if any required fields are empty
    if (!signData.get("signUsername") || !signData.get("signPassword")) {
        // Display an error message indicating empty fields
        let errormsg = document.getElementById("sign-error-msg");
        errormsg.textContent = "Please fill in all fields.";
        return;
    }

    //store new users in object
    const  newUser={
        username:"@"+signData.get("signUsername"),
        password:signData.get("signPassword"),
        picture:"/static/images/default.jpg",
        bio:""
    };
    const jnewUser=JSON.stringify(newUser);
    console.log(jnewUser);

    //retrieves password and confirmation password
    let pw=document.querySelector(".pw").value;
    let confirm_pw=document.querySelector(".confirm-pw").value;

    //retrieves div for displaying error message
    let errormsg=document.getElementById("sign-error-msg");

    //retrieves username in nav bar
    let nav_un=document.querySelector(".nav-username");

     //retrieves profile href in navbar
     let nav_profile = $('#profile-link');
     console.log("nav before ",nav_profile.attr('href'));

    if(pw==confirm_pw){
        try {
            const response = await fetch("/register", {
                method: 'POST',
                body: jnewUser,
                headers: {
                'Content-Type': 'application/json'
                }
            });
        
            if(response.status==200){
                errormsg.textContent="";
                home.classList.remove("show");
                //accountBtn.classList.remove("hidden");
                formOpenBtn.classList.add("hidden");
                //nav_un.textContent=signData.get("signUsername");
                //nav_profile.attr('href', `/profile/@${signData.get("signUsername")}`);
                location.reload();

            }
            else{
                console.log("Status code received: ", response.status);
                errormsg.textContent="Username is taken";
            }
        } catch (err) {
            console.error('Error occurred:', err);
        }
    }
    else{
        errormsg.textContent="Passwords do not match.";
    }
});

if(cantAuth==="true"){
    formOpenBtn.addEventListener("click", () => {
        console.log("called log in button");
            home.classList.add("show");
            formContainer.classList.remove("active");
            signup=false;
            closeLoginSignUp(signup);
    });
}

signUpBtn.addEventListener("click", (e) => {
        console.log("from log in, called sign up")
        e.preventDefault();
        formContainer.classList.add("active");
        signup=true;
        document.getElementById("signForm").reset()
        // DEBUG: console.log(signup);
        closeLoginSignUp(signup);
});
//switches to signup form
loginBtn.addEventListener("click", (e) => {
    console.log("from sign up, called log in")
    e.preventDefault();
    formContainer.classList.remove("active");
    signup=false;
    document.getElementById("loginForm").reset()
    // DEBUG: console.log(signup);
    closeLoginSignUp(signup);
});

function closeLoginSignUp(signup) {
    // DEBUG: console.log("inside close: " + signup);
    if (signup == true) {
        formCloseBtn.addEventListener("click", () => {
            home.classList.remove("show");
            formContainer.classList.add("active");
            document.getElementById("signForm").reset();
            // DEBUG: console.log(signup);
        });
    } else {
        formCloseBtn.addEventListener("click", () => {
            home.classList.remove("show");
            formContainer.classList.remove("active");
            document.getElementById("loginForm").reset();
            // DEBUG: console.log(signup);
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input");
    searchInput.addEventListener("keyup", search);
});

function search() {
    const searchbox = document.getElementById("search-input").value.toLowerCase();
    const postItems = document.getElementsByClassName("individual-post");

    const searchEvent = new CustomEvent("search", { detail: { query: searchbox } });
    document.dispatchEvent(searchEvent);
}