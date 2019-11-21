// Imports ----------------------------------------------------------------------------------------------

// Logindata --------------------------------------------------------------------------------------------
let logindata = JSON.parse(sessionStorage.getItem("logindata"));
if (!logindata) {
    window.location.href = "./userlogin.html";
}
let token = logindata.token;

// GET user ----------------------------------------------------------------------------------------------
export async function getUserById(id) {
    let url = `http://localhost:3000/users/${id}`;

    let cfg = {
        method: "GET",
        headers: { "authorisation": token }
    }

    var resp = await fetch(url, cfg);
    var user = await resp.json();

    if (resp.status == 403) {
        // If user hasn't logged in, go to the login page
        window.location.href = "./userlogin.html";
        return;
    } else if (resp.status > 202) {
        throw (user);
    }

    return user;
}

// Show users with access --------------------------------------------------------------------------------
let modal = document.getElementById("accessModal");
let modalBody = document.getElementsByClassName("modal-body")[0];
let span = document.getElementsByClassName("close")[0];
let sharedWith = document.getElementById("sharedWith");

sharedWith.addEventListener('click', async function () {

    modal.style.display = "block";
    let list = JSON.parse(localStorage.getItem("listinfo"));

    for (let id of list.individual_access) {
        let user = await getUserById(id);
        
        if(user.id != logindata.userid) {
            let div = document.createElement('div');

        let img = document.createElement('img');
        img.setAttribute('src', "../img/boy_1.png"); //TODO
        div.appendChild(img);

        let name = document.createElement('p');
        name.innerHTML = user.username;
        div.appendChild(name);

        modalBody.appendChild(div);
        }
    }

});

span.addEventListener('click', function () {
    modal.style.display = "none";
});

window.addEventListener('click', function () {
    if (event.target == modal) {
        modal.style.display = "none";
    }
});