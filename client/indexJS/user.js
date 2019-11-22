// Imports ----------------------------------------------------------------------------------------------
import { updateList, openList } from './list.js';

// Logindata --------------------------------------------------------------------------------------------
let logindata = JSON.parse(sessionStorage.getItem("logindata"));
if (!logindata) {
    window.location.href = "./userlogin.html";
}
let token = logindata.token;

// GET user ----------------------------------------------------------------------------------------------
export async function getUserBy(property, value) {
    let url = `http://localhost:3000/users/${property}/${value}`;

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
        let user = await getUserBy("id", id);

        let div = document.createElement('div');
        div.setAttribute('class', 'sharedWith');

        let greybox = document.createElement('div');
        greybox.setAttribute('class', 'greybox');

        let img = document.createElement('img');
        img.setAttribute('src', `../img/avatar_${user.avatar}.png`); 
        greybox.appendChild(img);

        let name = document.createElement('p');
        name.innerHTML = user.id == logindata.userid ? "me" : user.username;
        greybox.appendChild(name);

        div.appendChild(greybox);

        if (user.id == logindata.userid) {
            let removeAccessBtn = document.createElement('img');
            removeAccessBtn.setAttribute('src', '../img/trash.png');
            removeAccessBtn.addEventListener('click', function () {
                removeAccess(id);
                shareModal.style.display = "none";
            });
            div.appendChild(removeAccessBtn);
            accessModalBody.prepend(div);
        } else {
            let removeAccessDiv = document.createElement('div');
            div.appendChild(removeAccessDiv);
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
let shareModalSpan = document.getElementsByClassName("close")[1];
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
            let user = await getUserBy("id", id);

            if (user.id != logindata.userid) {
                let div = document.createElement('div');
                div.setAttribute('class', 'sharedWith')

                let greybox = document.createElement('div');
                greybox.setAttribute('class', 'greybox');

                let img = document.createElement('img');
                img.setAttribute('src', `../img/avatar_${user.avatar}.png`); //TODO
                greybox.appendChild(img);

                let name = document.createElement('p');
                name.innerHTML = user.username;
                greybox.appendChild(name);

                div.appendChild(greybox);

                let removeUser = document.createElement('img');
                removeUser.setAttribute('src', '../img/trash.png');
                removeUser.addEventListener('click', function () {
                    removeAccess(id);
                    shareModal.style.display = "none";
                });

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

// Remove access by id --------------------------------------------------------------------------------------
async function removeAccess(id) {
    let list = JSON.parse(localStorage.getItem('listinfo'));
    let index = list.individual_access.indexOf(id);
    list.individual_access.splice(index, 1);

    localStorage.setItem("listinfo", JSON.stringify(list));
    await updateList("individual_access", list.individual_access);
    if(list.individual_access.length > 0) {
        openList();
    } else {
        window.location.reload();
    }
    
}

// Add access by id -----------------------------------------------------------------------------------
function addAccess(id) {
    let list = JSON.parse(localStorage.getItem('listinfo'));
    if (id != logindata.userid) {
        if (list.individual_access && !list.individual_access.includes(id)) {
            list.individual_access.push(id);
        } else {
            list.individual_access = [id];
        }
        localStorage.setItem("listinfo", JSON.stringify(list));
        updateList("individual_access", list.individual_access);
        openList();
    }
}

// Give user access -----------------------------------------------------------------------------------------
let searchUname = document.getElementById("searchUname");
let searchEmail = document.getElementById("searchEmail");
let btnSearch = document.getElementById("btnSearch");

btnSearch.addEventListener('click', async function () {
    try {
        if (searchUname.value) {
            let res = await getUserBy("username", searchUname.value);
            if (confirm(`Share with ${res.username}?`)) {
                addAccess(res.id);
                shareModal.style.display = "none";
            }
        } else if (searchEmail.value) {
            let res = await getUserBy("email", searchEmail.value);
            if (confirm(`Share with ${res.username}?`)) {
                addAccess(res.id);
                shareModal.style.display = "none";
            }
        }
    } catch (err) {
        console.log(err);
        if (err.msg) {
            alert(err.msg);
        }
    }
});