const form = document.getElementById("search-form");
const input = document.getElementById("search-input");

form.addEventListener("submit", (event) => {
  event.preventDefault();       // stop the page from reloading
  const query = input.value;    // read what the user typed
  console.log("User searched:", query);
});