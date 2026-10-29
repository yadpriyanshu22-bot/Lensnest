
const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const results = document.getElementById("results");
const statusText = document.getElementById("status");
const categoryButtons = document.querySelectorAll(".categories button");

// Create an image card
function createImageCard(image) {
  const card = document.createElement("article");
  card.className = "image-card";

  const link = document.createElement("a");
  link.href = image.pageUrl || image.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.title = image.title;

  const img = document.createElement("img");
  img.src = image.url;
  img.alt = image.title;
  img.loading = "lazy";

  img.addEventListener("error", () => {
    card.remove();
  });

  const caption = document.createElement("div");
  caption.className = "image-caption";
  caption.textContent = image.title;

  if (image.credit) {
    const credit = document.createElement("span");
    credit.className = "image-credit";
    credit.textContent = image.credit;
    caption.appendChild(credit);
  }

  link.appendChild(img);
  link.appendChild(caption);
  card.appendChild(link);

  return card;
}

// Display search results
function showImages(images) {
  results.replaceChildren();

  if (!images.length) {
    showMessage("No images found. Try another search.");
    return;
  }

  const fragment = document.createDocumentFragment();

  images.forEach((image) => {
    fragment.appendChild(createImageCard(image));
  });

  results.appendChild(fragment);
}

// Display a message
function showMessage(message) {
  results.replaceChildren();

  const element = document.createElement("div");
  element.className = "message";
  element.textContent = message;

  results.appendChild(element);
}

// Highlight the selected category
function setActiveCategory(query) {
  categoryButtons.forEach((button) => {
    const active =
      button.dataset.query === query.toLowerCase();

    button.classList.toggle("active", active);
  });
}

// Search Wikimedia Commons
async function searchImages(query) {
  const searchTerm = query.trim();

  if (!searchTerm) {
    input.focus();
    statusText.textContent =
      "Please enter something to search for.";
    return;
  }

  setActiveCategory(searchTerm);

  searchButton.disabled = true;
  searchButton.textContent = "Searching...";

  statusText.textContent =
    `Searching for "${searchTerm}"...`;

  showMessage("Finding images for you...");

  try {
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      origin: "*",
      generator: "search",
      gsrsearch: `${searchTerm} filetype:bitmap`,
      gsrnamespace: "6",
      gsrlimit: "12",
      prop: "imageinfo",
      iiprop: "url",
      iiurlwidth: "700"
    });

    const apiUrl =
      `https://commons.wikimedia.org/w/api.php?${params.toString()}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(
        "The image service could not be reached."
      );
    }

    const data = await response.json();
    const pages = Object.values(
      data.query?.pages || {}
    );

    const images = pages
      .filter(
        (page) =>
          page.imageinfo &&
          page.imageinfo.length > 0
      )
      .map((page) => ({
        title: page.title.replace(/^File:/, ""),
        url:
          page.imageinfo[0].thumburl ||
          page.imageinfo[0].url,
        pageUrl: page.imageinfo[0].descriptionurl,
        credit: "Source: Wikimedia Commons"
      }));

    if (images.length === 0) {
      statusText.textContent =
        `No results found for "${searchTerm}".`;

      showMessage(
        "Try another keyword, such as nature, cars, or flowers."
      );
    } else {
      statusText.textContent =
        `Showing ${images.length} results for "${searchTerm}".`;

      showImages(images);
    }
  } catch (error) {
    console.error("Image search failed:", error);

    statusText.textContent =
      "Image search couldn't connect.";

    showMessage(
      "Please check your internet connection and try again."
    );
  } finally {
    searchButton.disabled = false;
    searchButton.textContent = "Search";
  }
}

// Handle search form submission
form.addEventListener("submit", (event) => {
  event.preventDefault();
  searchImages(input.value);
});

// Make category buttons work
categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const query = button.dataset.query;
    input.value = query;
    searchImages(query);
  });
});

// Start with an empty gallery — no default images
results.replaceChildren();

statusText.textContent =
  "Search for something you love to discover images.";
