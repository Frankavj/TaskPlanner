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