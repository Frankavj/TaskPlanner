// Imports ----------------------------------------------------------------------------------------------
import {showLists} from './list.js';

// Logindata --------------------------------------------------------------------------------------------
let logindata = JSON.parse(sessionStorage.getItem("logindata"));
if (!logindata) {
    window.location.href = "./userlogin.html";
}

// Show correct username on sidebar ---------------------------------------------------------------------
let myName = document.getElementById("myName");
myName.innerHTML = logindata.username;

// redirect to other pages ------------------------------------------------------------------------------
let btnMyProfile = document.getElementById('myProfile');
let btnLogout = document.getElementById('logout');

btnMyProfile.addEventListener('click', function () {
    window.location.href = "./user.html";
});

btnLogout.addEventListener('click', function () {
    sessionStorage.removeItem('logindata');
    window.location.href = "./userlogin.html";
});


// sidebar expand/collapse ------------------------------------------------------------------------------
let privateHeader = document.getElementById('private');
let privateContainer = document.getElementById('privateLists');
let publicHeader = document.getElementById('public');
let publicContainer = document.getElementById('publicLists');
let individualHeader = document.getElementById('individual');
let individualContainer = document.getElementById('individualLists');
let sharedHeader = document.getElementById('shared');
let sharedContainer = document.getElementById('sharedLists');

privateHeader.addEventListener('click', function () {
    toggleLists(privateContainer, "private");
});

publicHeader.addEventListener('click', function () {
    toggleLists(publicContainer, "public");
});

individualHeader.addEventListener('click', function () {
    toggleLists(individualContainer, "individual");
});

sharedHeader.addEventListener('click', function () {
    toggleLists(sharedContainer, "shared");
});

async function toggleLists(container, shared) {
    if (container.innerHTML == "") {
        await showLists(container, shared);
    } else {
        container.innerHTML = "";
        container.classList.add("hidden");
    }
}

let privateDrop= document.getElementById("privateDrop");
let dropdownPrivate = document.getElementById("dropdownPrivate");

privateDrop.addEventListener('click', function () {
    dropdownPrivate.classList.toggle("hidden")
    toggleLists(dropdownPrivate, "private");
});



