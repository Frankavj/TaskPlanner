// Imports ----------------------------------------------------------------------------------------------
// import {showLists} from './indexList.js.js';

// Logindata --------------------------------------------------------------------------------------------
let logindata = JSON.parse(sessionStorage.getItem("logindata"));
if (!logindata) {
    window.location.href = "./userlogin.html";
}
let token = logindata.token;

// HTML elements -----------------------------------------------------------------------------------------
let leftHeader = document.getElementById('columnL');
let leftContainer = document.getElementById('containerL');
let rightHeader = document.getElementById('columnR');
let rightContainer = document.getElementById('containerR');

// POST tasks --------------------------------------------------------------------------------------------
let newTask = document.createElement('div');
newTask.setAttribute('class', "newTask");
newTask.setAttribute('id', "newTask");

let taskName = document.createElement('input');
taskName.classList.add("hidden");
taskName.setAttribute("placeholder", "My new task");
taskName.setAttribute('id', "taskName");
newTask.appendChild(taskName);

let taskAddImg = document.createElement('img');
taskAddImg.setAttribute('class', "addImgTask");
taskAddImg.setAttribute('src', "/img/add_home.png");
taskAddImg.setAttribute('id', "taskAddImg");
newTask.appendChild(taskAddImg);

let taskAddTxt = document.createElement('p');
taskAddTxt.innerHTML = "Add task";
taskAddTxt.setAttribute('id', "taskAddTxt");
newTask.appendChild(taskAddTxt);

newTask.addEventListener('click', function () {
    taskAddImg.classList.add("hidden");
    taskAddTxt.classList.add("hidden");
    taskName.classList.remove("hidden");
    newTask.classList.add("newTaskInp");
});

taskName.addEventListener('blur', function () {
    taskAddImg.classList.remove("hidden");
    taskAddTxt.classList.remove("hidden");
    taskName.classList.add("hidden");
    newTask.classList.remove("newTaskInp");
});

taskName.addEventListener('keydown', function () {
    if (event.keyCode == 13 && taskName.value) {
        createTask(taskName.value);
    }
});

// ------------------------------------------
export async function createTask(name) {
    let taskName = document.getElementById('taskName');
    let taskAddImg = document.getElementById('taskAddImg');
    let taskAddTxt = document.getElementById('taskAddTxt');
    let newTask = document.getElementById('newTask');

    taskName.value = "";

    let url = "http://localhost:3000/tasks";

    let list = JSON.parse(localStorage.getItem('listinfo'));

    let updata = {
        name: name,
        list: list.id,
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

        // reload the tasks of the current list
        loadTasks();
        taskAddImg.classList.remove("hidden");
        taskAddTxt.classList.remove("hidden");
        taskName.classList.add("hidden");
        newTask.classList.remove("newTaskInp");
    } catch (err) {
        console.log(err);
    }
}


// GET tasks ---------------------------------------------------------------------------------------------
export async function loadTasks() {
    showTasks(rightContainer, 1);
    rightContainer.classList.remove('taskview');
    rightHeader.contentEditable = false;
    leftHeader.innerHTML = "Tasks";
    rightHeader.innerHTML = "Completed tasks";
    await showTasks(leftContainer, 0);
    leftContainer.appendChild(newTask);
}

async function showTasks(container, completed) {

    let list = JSON.parse(localStorage.getItem('listinfo'));

    try {
        let url = `http://localhost:3000/tasks/${list.id}/${completed}`;

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

        for (let value of data) {

            let div = document.createElement('div');
            div.setAttribute('class', 'deleteable');

            let whitebox = document.createElement('div');
            whitebox.setAttribute('class', 'task whitebox');
            div.appendChild(whitebox);

            // PUT task
            let checkbox = document.createElement('img');
            checkbox.setAttribute("class", "checkbox");
            if (!completed) {
                checkbox.setAttribute("src", "/img/unchecked_check.png"); // img: empty checkbox
                checkbox.addEventListener('click', function () {
                    updateTask(value.id, "completed", 1);
                });
            } else {
                checkbox.setAttribute("src", "/img/check.png"); // img: checked box
                checkbox.addEventListener('click', function () {
                    updateTask(value.id, "completed", 0);
                });
            }
            whitebox.appendChild(checkbox);

            let taskName = document.createElement('p');
            taskName.setAttribute("class", "taskName");
            taskName.innerHTML = value.name;
            taskName.addEventListener('click', function (evt) {
                localStorage.setItem("taskinfo", JSON.stringify(value));
                toggleTask();
            });
            whitebox.appendChild(taskName);

            // DELETE task
            let btnTaskDelete = document.createElement('img');
            btnTaskDelete.setAttribute("class", "deleteTask");
            btnTaskDelete.setAttribute("src", "/img/trash.png");
            btnTaskDelete.addEventListener('click', function () {
                deleteTask(value.id);
            });
            div.appendChild(btnTaskDelete);

            container.appendChild(div);
        }
    } catch (err) {
        console.log(err);
    }
}

// Open task ----------------------------------------------------------------------------------------------
function toggleTask() {
    let task = JSON.parse(localStorage.getItem('taskinfo'));
    if (!rightHeader.innerHTML.localeCompare(task.name)) {
        loadTasks();
    } else {
        openTask();
    }
}

function openTask() {
    let task = JSON.parse(localStorage.getItem('taskinfo'));
    rightContainer.innerHTML = ""; // remove previous content
    rightHeader.innerHTML = task.name;
    rightContainer.classList.add('taskview');

    // task name
    rightHeader.contentEditable = true;
    rightHeader.addEventListener('keydown', function (evt) {
        if (event.keyCode == 13) {
            evt.preventDefault();
            updateTask(task.id, "name", rightHeader.innerHTML);
        }
    });

    // deadline
    let deadlineDiv = document.createElement('div');
    deadlineDiv.setAttribute("class", "deadline whitebox");
    deadlineDiv.addEventListener('click', function () {
        /// TODO Thomas
        // allow users to choose deadline, send to updateTask()
        // params for updateTask: task.id, "deadline", *the new deadline value*
    });

    let deadlineImg = document.createElement('img');
    deadlineImg.setAttribute('src', '/img/appointment-reminders.png');
    deadlineImg.setAttribute('class', 'bell');
    deadlineDiv.appendChild(deadlineImg);

    let deadlineTxt = document.createElement('p');
    if (task.deadline) {
        deadlineTxt.innerHTML = "Due date: " + task.deadline;
    } else {
        deadlineTxt.innerHTML = "No due date set";
    }
    deadlineDiv.appendChild(deadlineTxt);

    rightContainer.appendChild(deadlineDiv);

    // notes
    let notesDiv = document.createElement('div');
    notesDiv.setAttribute("class", "notesDiv");

    let notesTitle = document.createElement('p');
    notesTitle.innerHTML = "Notes:";
    notesDiv.appendChild(notesTitle);

    let notesbtn = document.createElement('img');
    notesbtn.setAttribute('src', '/img/icon-edit.png');
    notesDiv.appendChild(notesbtn);

    rightContainer.appendChild(notesDiv);

    let notes = document.createElement('p');
    notes.setAttribute("class", "notes whitebox");
    notes.innerHTML = task.notes;
    rightContainer.appendChild(notes);

    // PUT notes
    notesbtn.addEventListener('click', function () {
        if (notesbtn.src.includes("edit")) {
            notesbtn.src = '/img/check.png';
            notes.contentEditable = true;
        } else {
            notesbtn.src = '/img/icon-edit.png';
            notes.contentEditable = false;
            updateTask(task.id, "notes", notes.innerHTML);
        }
    });

}


// PUT tasks ----------------------------------------------------------------------------------------------
async function updateTask(taskid, feature, value) {
    console.log("update " + taskid + ": " + feature + ", " + value);

    if (!value && value !== 0) {
        return;
    }

    let url = `http://localhost:3000/tasks/`;

    let updata = {
        update: feature,
        value: value,
        taskid: taskid
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

        // Everything OK: reload
        if (!feature.localeCompare('completed')) {
            loadTasks();
        } else {
            let taskinfo = JSON.parse(localStorage.getItem("taskinfo"));
            taskinfo[feature] = value;
            localStorage.setItem("taskinfo", JSON.stringify(taskinfo));
            if (!feature.localeCompare('name')) {
                await showTasks(leftContainer, 0);
                leftContainer.appendChild(newTask);
            }
            openTask();
        }


    } catch (err) {
        console.log(err);
    }
}


// DELETE tasks ------------------------------------------------------------------------------------------
async function deleteTask(id) {

    let url = "http://localhost:3000/tasks";

    let updata = { taskid: id };
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
        loadTasks();
    } catch (err) {
        console.log(err);
    }
}

