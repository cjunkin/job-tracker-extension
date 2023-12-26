/* -------------------------------------------------------------------------- */
/*                                Functions                                   */
/* -------------------------------------------------------------------------- */

// Append entry into application list
function addLinkToPage(title, url) {
    const element = template.content.cloneNode(true);
    element.querySelector(".title").textContent = title;
    element.querySelector(".link").href = url;
    element.querySelector(".link").textContent = url;
    pagesList.appendChild(element);
}

// Save extension data into chrome's storage
function saveData() {
    let data = {
        count: count,
        links: links
    };

    chrome.storage.sync.set({ [currentDate]: data }, () => {
        console.log('Data saved for ' + currentDate);
    });
}

function changeCount(amount) {
    count = count + amount >= 0 ? count + amount : 0;
    display.innerHTML = count;
    saveData();
}

/* -------------
[ Current Date ] 
---------------- */
const date = new Date();
let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();
let currentDate = `${month}/${day}/${year}`;

const dateDisplay = document.getElementById("date");
dateDisplay.innerHTML = currentDate;

/* ------------- 
[ Loading Data ] 
---------------- */
// Asynchronously retrieve data from storage.sync, then cache it.
let count = 0;
let links = [];
const display = document.getElementById("num");
const initStorageCache = chrome.storage.sync.get([currentDate], (items) => {
    // Copy the data retrieved from storage into storageCache.
    if (items[currentDate]) {
        count = items[currentDate].count ?? 0;
        links = items[currentDate].links ?? [];

        links.forEach(link => {
            addLinkToPage(link.title, link.url);
        });
    }

    // Update display with stored count
    display.innerHTML = count;
});

/* ------------- 
[ Button Logic ] 
---------------- */
const plus = document.getElementById("plus");
const minus = document.getElementById("minus");
plus.addEventListener("click", async () => {
    changeCount(1);
});

minus.addEventListener("click", async () => {
    changeCount(-1);
});

/* --------------------------- 
[ Application Tracking Logic ] 
------------------------------ */
const applied = document.getElementById("applied");
const pagesList = document.querySelector(".pages");
const template = document.getElementById("page_template");
applied.addEventListener("click", async () => {
    const tabs = await chrome.tabs.query({active: true, lastFocusedWindow: true});
    let tab = tabs[0];
    const title = tab.title.split("-")[0].trim();
    const url = tab.url;

    const element = template.content.firstElementChild.cloneNode(true);
    element.querySelector(".title").textContent = title;
    element.querySelector(".link").href = url;
    element.querySelector(".link").textContent = url;

    pagesList.appendChild(element);
    changeCount(1);

    // Add the new link to the links array and save data
    links.push({ title: title, url: url });
    saveData();
});

/* --------- 
[ Dropdown ] 
------------ */
const toggleDropdownButton = document.getElementById("toggleDropdown");
const dropdownMenu = document.getElementById("dropdownMenu");

// Restore dropdown state
chrome.storage.local.get(['dropdownOpen'], (result) => {
    dropdownMenu.style.display = result.dropdownOpen ? 'block' : 'none'
    toggleDropdownButton.textContent = result.dropdownOpen ? 'Hide Applications' : 'Show Applications';
});

toggleDropdownButton.addEventListener("click", () => {
    const isDropdownOpen = dropdownMenu.style.display === 'block';
    dropdownMenu.style.display = isDropdownOpen ? 'none' : 'block';

    // Change button text accordingly
    toggleDropdownButton.textContent = isDropdownOpen ? 'Show Applications' : 'Hide Applications';

    // Save the current state of the dropdown
    chrome.storage.local.set({ 'dropdownOpen': !isDropdownOpen });
});