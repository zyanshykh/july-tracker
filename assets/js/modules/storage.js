// ==============================
// Interactive Checklist
// ==============================

const tasks = document.querySelectorAll(".task");

tasks.forEach(task=>{

    task.addEventListener("change",()=>{

        updateChecklistProgress();

    });

});

function updateChecklistProgress(){

    const total = tasks.length;

    let completed = 0;

    tasks.forEach(task=>{

        if(task.checked){

            completed++;

        }

    });

    console.log(`Completed ${completed}/${total}`);

}

// ==============================
// Checklist + LocalStorage
// ==============================

const tasks = document.querySelectorAll(".task");

loadTasks();

tasks.forEach((task, index) => {

    task.addEventListener("change", () => {

        saveTasks();

        updateChecklistProgress();

    });

});

function saveTasks() {

    const taskState = [];

    tasks.forEach(task => {

        taskState.push(task.checked);

    });

    localStorage.setItem("dailyTasks", JSON.stringify(taskState));

}

function loadTasks() {

    const savedTasks = JSON.parse(localStorage.getItem("dailyTasks"));

    if (!savedTasks) return;

    tasks.forEach((task, index) => {

        task.checked = savedTasks[index];

    });

}

function updateChecklistProgress() {

    let completed = 0;

    tasks.forEach(task => {

        if(task.checked){

            completed++;

        }

    });

    document.getElementById("task-progress").textContent =
        `${completed} / ${tasks.length} Completed`;

}

const Storage = {

    save(key,value){

        localStorage.setItem(key,JSON.stringify(value));

    },

    load(key){

        return JSON.parse(localStorage.getItem(key));

    }

};

Storage.save("dailyTasks", taskState);

const data = Storage.load("dailyTasks");

localStorage.setItem("theme","light");