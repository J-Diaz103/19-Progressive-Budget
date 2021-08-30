let db;
const request = indexedDB.open("budget", 2);

request.onupgradeneeded = (event) => {
  const db = event.target.result;
  db.createObjectStore("transactions", { autoIncrement: true });
};

request.onsuccess = (event) => {
  db = event.target.result;
  if (navigator.onLine) {
    console.log("App is Online");
    checkDatabase();
  }
};

request.onerror = (event) => {
  console.log("Error " + event.target.errorCode);
};

function saveRecord(record) {
  console.log("Your currently Offline, but The record is Saved:" + record);
  //creating a transaction with readwrite access
  const transaction = db.transaction(["transactions"], "readwrite");

  // create an access to your transactions object store
  const store = transaction.objectStore("transactions");
  store.add(record);
}

function checkDatabase() {
  // check a transaction on your transactions db
  const transaction = db.transaction(["transactions"], "readwrite");
  // access your transactions object store
  const store = transaction.objectStore("transactions");
  // create a variable and get all records from store
  const getAll = store.getAll();

  getAll.onsuccess = () => {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          console.log("transaction successfully saved from offline");
          const transaction = db.transaction(["transactions"], "readwrite");

          const store = transaction.objectStore("transactions");
          store.clear();
        });
    }
  };
}

window.addEventListener("online", checkDatabase);
