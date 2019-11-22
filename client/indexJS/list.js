// Imports ----------------------------------------------------------------------------------------------
import { createTask, loadTasks } from './task.js';
import { getUserBy } from './user.js';

// Logindata --------------------------------------------------------------------------------------------
let logindata = JSON.parse(sessionStorage.getItem("logindata"));
if (!logindata) {
    window.location.href = "./userlogin.html";
}
let token = logindata.token;

// POST list --------------------------------------------------------------------------------------------
// sidebar button ---------------------------------------
let addImgSB = document.getElementById('addImgSB');
let inpNameSB = document.getElementById('inpNameSB');

addImgSB.addEventListener('click', function () {
    addImgSB.classList.add('hidden');
    inpNameSB.classList.remove("hidden");
});

window.addEventListener('click', function () {
    if (event.target != inpNameSB && event.target != addImgSB) {
        addImgSB.classList.remove("hidden");
        inpNameSB.classList.add("hidden");
    }
});

inpNameSB.addEventListener('keydown', function () {
    if (event.keyCode == 13 && inpNameSB.value) {
        createList(inpNameSB.value);
    }
});

// homepage button ---------------------------------------
let newList = document.getElementById('newList');
let addImg = document.getElementById('addImg');
let inpName = document.getElementById('inpName');
let createTxt = document.getElementById('createTxt');

newList.addEventListener('click', function () {
    addImg.classList.add("hidden");
    createTxt.classList.add("hidden");
    inpName.classList.remove("hidden");
});

window.addEventListener('click', function () {
    if (event.target != inpName && event.target != createTxt && event.target != addImg) {
        addImg.classList.remove("hidden");
        createTxt.classList.remove("hidden");
        inpName.classList.add("hidden");
    }
});

inpName.addEventListener('keydown', function () {
    if (event.keyCode == 13 && inpName.value) {
        createList(inpName.value);
    }
});

// POST list -------------------------------------------
async function createList(name) {
    inpNameSB.value = "";
    inpName.value = "";

    let url = "http://localhost:3000/lists";

    let updata = {
        listname: name
    }

    let cfg = {
        method: "POST",
        headers: {
            "Content-type": "application/json",
            "authorisation": token
        },
        body: JSON.stringify(updata)
    }

    try {
        await fetch(url, cfg);

        window.location.reload();
    } catch (err) {
        console.log(err);
    }
}


// GET all public lists ---------------------------------------------------------------------------------
let contentBox = document.getElementById("contentBox");

let btnSharedWith = document.getElementById('sharedWith');
let btnShare = document.getElementById('btnShare');
let btnAddPeople = document.getElementById('btnAddPeople');
let btnListDelete = document.getElementById('btnListDelete');

let sharedBy = document.getElementById('sharedBy');

let allLists = document.getElementById('allLists');
let leftHeader = document.getElementById('columnL');
let leftContainer = document.getElementById('containerL');
let rightHeader = document.getElementById('columnR');
let rightContainer = document.getElementById('containerR');

allLists.addEventListener('click', function () {
    // hide the newlist button
    newList.classList.add("hidden");

    showLists(leftContainer, "allpublic");
    leftHeader.innerHTML = "Lists";
    rightContainer.classList.add("hidden");
    rightHeader.classList.add("hidden");
});


// GET private and public lists of user (homepage) ------------------------------------------------------
showLists(leftContainer, "private");
showLists(rightContainer, "public");
// show the newlist button
newList.classList.remove("hidden");

// GET list ---------------------------------------------------------------------------------------------
export async function showLists(container, shared) {
    if (!shared.localeCompare("allpublic")) {
        btnShare.classList.add("hidden");
        btnSharedWith.classList.add("hidden");
        btnAddPeople.classList.add("hidden");
        btnListDelete.classList.add("hidden");
        contentBox.classList.add("showAllLists");
        sharedBy.classList.add('hidden');
    }

    try {
        let url = `http://localhost:3000/lists/${shared}`;

        let cfg = {
            method: "GET",
            headers: { "authorisation": token }
        };

        var resp = await fetch(url, cfg);
        var data = await resp.json();

        if (resp.status == 403) {
            //If user hasn't logged in, go to the login page
            window.location.href = "./userlogin.html";
            return;
        } else if (resp.status > 202) {
            throw (data);
        }

        container.innerHTML = ""; // delete previous content
        if (data.length > 0) {
            container.classList.remove("hidden");
        }

        for (let value of data) {

            let div = document.createElement('div');
            let name = document.createElement('p');
            name.classList.add('class', "listName");
            name.innerHTML = value.name;
            name.addEventListener('click', function (evt) {
                localStorage.setItem('listinfo', JSON.stringify(value));
                openList();
            });
            div.appendChild(name);

            if ((container.id == "containerR" || container.id == "containerL") && shared.localeCompare("allpublic")) {
                div.setAttribute('class', "deleteable");
                name.classList.add('class', "whitebox");
                let delList = document.createElement('img');
                delList.setAttribute('src', "/img/trash.png");
                delList.setAttribute('class', 'deleteTask');
                delList.addEventListener('click', function () {
                    deleteList(value.id);
                });
                div.appendChild(delList);
            }

            if (!shared.localeCompare("allpublic")) {
                // get the name of the owner and desplay it
                let user = await getUserBy("id", value.owner);

                div.classList.add("sharedListDiv");
                div.classList.add("whitebox");

                let owner = document.createElement('div');

                let ownerName = document.createElement('p');
                if (user.id == logindata.userid) {
                    ownerName.innerHTML = `Shared by me`;
                } else {
                    ownerName.innerHTML = `Shared by ${user.username}`;
                }
                owner.appendChild(ownerName);

                let ownerImg = document.createElement('img');
                ownerImg.setAttribute('src', 'img/boy_1.png');
                owner.appendChild(ownerImg);

                div.appendChild(owner);
            }
            container.appendChild(div);
        }
    } catch (err) {
        console.log(err);
    }
}

// Open list -----------------------------------------------------------------------------------------
let title = document.getElementById('listTitle');

export async function openList() {
    contentBox.classList.remove("showAllLists");
    rightHeader.contentEditable = false;
    rightContainer.classList.remove('taskview');

    // hide the newlist button
    newList.classList.add("hidden");

    let list = JSON.parse(localStorage.getItem('listinfo'));
    title.innerHTML = list.name;

    rightContainer.classList.remove("hidden");
    rightHeader.classList.remove("hidden");

    leftContainer.innerHTML = "";
    rightContainer.innerHTML = "";

    // GET tasks 
    loadTasks();

    // show share, addPeople and delete btns based on shared property of this list
    if (list.owner == logindata.userid) {
        // my list
        if (list.shared) {
            // public
            btnShare.classList.remove("hidden");
            btnShare.setAttribute("src", "/img/unshare.png");
            btnAddPeople.classList.add("hidden");
        } else {
            // private or individual
            btnShare.classList.remove("hidden");
            btnShare.setAttribute("src", "/img/share.png")
            btnAddPeople.classList.remove("hidden");
        }
        btnListDelete.classList.remove("hidden");
        sharedBy.classList.add('hidden');
        btnSharedWith.classList.add("hidden");
    } else {
        btnSharedWith.classList.add("hidden");
        sharedBy.classList.remove('hidden');
        btnListDelete.classList.add("hidden");

        // get owner name and profile picture
        let owner = await getUserBy("id", list.owner);
        sharedByTxt.innerHTML = `Shared by ${owner.username}`;
        sharedByImg.setAttribute('src', '/img/boy_1.png');

        btnShare.classList.add("hidden");
        btnAddPeople.classList.add("hidden");
        if (!list.shared) {
            // individual list
            btnSharedWith.classList.remove("hidden");
        }
    }

}

// PUT list --------------------------------------------------------------------------------------------
// name ----------------------------------------------------
title.addEventListener('keydown', function (evt) {
    if (event.keyCode == 13) {
        evt.preventDefault();
        updateList("name", title.innerHTML);
    }
});

// shared --------------------------------------------------
btnShare.addEventListener('click', function () {
    let list = JSON.parse(localStorage.getItem('listinfo'));
    if (list.shared) {
        //public -> private/individual
        updateList("shared", false);
    } else {
        //private/individual -> public
        updateList("shared", true);
        if (list.individual_access) {
            //individual -> public : no individual_access
            updateList("individual_access", null);
        }
    }
});

// individual access ---------------------------------------
btnAddPeople.addEventListener('click', function () {
    ///TODO give users individual access
});

// PUT list ------------------------------------------------
export async function updateList(feature, value) {

    let list = JSON.parse(localStorage.getItem('listinfo'));

    let url = `http://localhost:3000/lists`;

    let updata = {
        update: feature,
        value: value,
        listid: list.id
    }

    let cfg = {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "authorisation": token
        },
        body: JSON.stringify(updata)
    }

    try {

        var resp = await fetch(url, cfg);
        var data = await resp.json();

        if (resp.status == 403) {
            window.location.href = "./userlogin.html";
            return;
        } else if (resp.status > 202) {
            throw (data);
        }

        // Everything OK: reload list
        if (!feature.localeCompare("name")) {
            privateContainer.innerHTML = "";
            publicContainer.innerHTML = "";
            individualContainer.innerHTML = "";

            list.name = value;
            localStorage.setItem('listinfo', JSON.stringify(list));

            openList();
        } else if (feature.localeCompare("individual_access")) {
            window.location.reload();
        }

    } catch (err) {
        console.log(err);
    }
}


// DELETE list -------------------------------------------------------------------------------------------
btnListDelete.addEventListener('click', function () {
    let list = JSON.parse(localStorage.getItem('listinfo'));
    deleteList(list.id);
});

async function deleteList(id) {

    let url = "http://localhost:3000/lists";

    let updata = { listid: id };
    let cfg = {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "authorisation": token
        },
        body: JSON.stringify(updata)
    }

    try {
        await fetch(url, cfg);
        window.location.reload();
    } catch (err) {
        console.log(err);
    }
}

