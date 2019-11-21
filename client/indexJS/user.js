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

// Show users with access - share with me -------------------------------------------------------------------
let accessModal = document.getElementById("accessModal");
let accessModalBody = document.getElementsByClassName("modal-body")[0];
let accessModalSpan = document.getElementsByClassName("close")[0];
let sharedWith = document.getElementById("sharedWith");

sharedWith.addEventListener('click', async function () {

    accessModal.style.display = "block";
    let list = JSON.parse(localStorage.getItem("listinfo"));

    accessModalBody.innerHTML = "" // remove previous content

    for (let id of list.individual_access) {
        let user = await getUserById(id);

        if (user.id != logindata.userid) {
            let div = document.createElement('div');
            div.setAttribute('class', 'theySharedWith');

            let img = document.createElement('img');
            img.setAttribute('src', "../img/boy_1.png"); //TODO
            div.appendChild(img);

            let name = document.createElement('p');
            name.innerHTML = user.username;
            div.appendChild(name);

            accessModalBody.appendChild(div);
        }
    }

});

accessModalSpan.addEventListener('click', function () {
    accessModal.style.display = "none";
});

window.addEventListener('click', function () {
    if (event.target == accessModal) {
        accessModal.style.display = "none";
    }
});

// Show users with access - shared by me --------------------------------------------------------------------
let shareModal = document.getElementById("shareModal");
let shareModalBody = document.getElementsByClassName("modal-body")[1];
let shareModalSpan = document.getElementsByClassName("close")[1];
let searchUname = document.getElementById("searchUname");
let searchEmail = document.getElementById("searchEmail");
let btnSearch = document.getElementById("btnSearch");
let have_accessTitle = document.getElementById("have_accessTitle");
let have_access = document.getElementById("have_access");
let share = document.getElementById("btnAddPeople");

share.addEventListener('click', async function () {

    shareModal.style.display = "block";

    let list = JSON.parse(localStorage.getItem("listinfo"));

    if (list.individual_access) {
        have_accessTitle.style.display = "block";
        have_access.style.display = "block";
        have_access.innerHTML = ""; // remove previous content

        for (let id of list.individual_access) {
            let user = await getUserById(id);

            if (user.id != logindata.userid) {
                let div = document.createElement('div');
                div.setAttribute('class', 'iSharedWith')

                let greybox = document.createElement('div');
                greybox.setAttribute('class', 'greybox');

                let img = document.createElement('img');
                img.setAttribute('src', "../img/boy_1.png"); //TODO
                greybox.appendChild(img);

                let name = document.createElement('p');
                name.innerHTML = user.username;
                greybox.appendChild(name);

                div.appendChild(greybox);

                let removeUser = document.createElement('img');
                removeUser.setAttribute('src', '../img/trash.png');

                div.appendChild(removeUser);

                have_access.appendChild(div);
            }
        }
    } else {
        have_accessTitle.style.display = "none";
        have_access.style.display = "none";
    }

});

shareModalSpan.addEventListener('click', function () {
    shareModal.style.display = "none";
});

window.addEventListener('click', function () {
    if (event.target == shareModal) {
        shareModal.style.display = "none";
    }
});