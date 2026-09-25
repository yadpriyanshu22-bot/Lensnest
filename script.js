const form = document.getElementById("search-form");
const input = document.getElementById("search-input");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const query = input.value.trim();

    if (!query) return;

    const url =
        "https://commons.wikimedia.org/w/api.php?action=query" +
        "&generator=search&gsrsearch=" + encodeURIComponent(query) +
        "&gsrnamespace=6&gsrlimit=12" +
        "&prop=imageinfo&iiprop=url&iiurlwidth=300" +
        "&format=json&origin=*";

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(response.status);
    }

    const data = await response.json();

    const items = Object.values(data.query.pages);

    render(items);
});

function render(items) {
    const results = document.getElementById("results");

    results.innerHTML = "";

    items.forEach((item) => {
        const card = document.createElement("article");
        card.className = "card";

        const img = document.createElement("img");
        img.src = item.imageinfo[0].thumburl;
        img.alt = item.title;

        const caption = document.createElement("p");
        caption.textContent = item.title;

        card.appendChild(img);
        card.appendChild(caption);

        results.appendChild(card);
    });
}
