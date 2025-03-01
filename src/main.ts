import './style.css'

// Fetch api data
export async function fetchHubData(): Promise<any>  {
  try {
    const res = await fetch('https://d1q0vy0v52gyjr.cloudfront.net/hub.json');
    
    if (!res || !res.ok) {
      throw new Error('Failed to fetch data');  // Handle non-2xx responses
    }
    
    const data = await res.json();
    
    // Render view of the page
    renderView(data);
    return data;
  } catch (error) {
    console.error('Error fetching Hub data:', error);
    renderErrorView();  // Render a fallback view with a retry option
  }
}

// Fetch data for individual collections with error handling
export async function fetchCollectionData(href: string): Promise<any> {
  try {
    const res = await fetch(href);
    
    if (!res || !res.ok) {
      throw new Error('Failed to fetch collection data');  // Handle non-2xx responses
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching collection data:', error);
    throw error;  // Propagate the error so it can be handled in the caller
  }
}

// Add keyboard navigation
let currentRow = 0;
let currentTile = 0;

function createVideoTile(item: any, rowIndex: number, tileIndex: number): HTMLElement {
  const tile = document.createElement('div');
  tile.classList.add('tile');
  tile.setAttribute('data-row-index', rowIndex.toString());
  tile.setAttribute('data-tile-index', tileIndex.toString());

  // Image for the tile
  const imgWrapper = document.createElement('div');
  imgWrapper.classList.add('img-wrapper');


  // Create the fallback text
  const fallbackText = document.createElement('span');
  fallbackText.innerHTML = 'Something went wrong. <br><br> Try again later ';
  imgWrapper.appendChild(fallbackText); // Initially, fallback text will be shown

  // Create the image element
  const img = document.createElement('img');
  img.src = `${item.visuals.artwork.horizontal_tile.image.path}&size=400x300&format=jpeg`;
  img.alt = item.visuals.headline || 'No Title';

  // Handle image loading error by displaying the fallback
  img.onerror = function () {
    img.style.display = 'none';  // Hide the image if there's an error
    fallbackText.style.display = 'block';  // Show the fallback text
  };

  // Handle successful image load
  img.onload = function () {
    img.style.display = 'block';  // Show the image if it loads successfully
    fallbackText.style.display = 'none';  // Hide the fallback text
  };

  // Append the image to the wrapper
  imgWrapper.appendChild(img);

  // Add watermark
  const watermarkImg = document.createElement('img');
  watermarkImg.src = '/Hulu-Logo.png'; // Path to your watermark image
  watermarkImg.classList.add('watermark-img');
  imgWrapper.appendChild(watermarkImg);

  tile.appendChild(imgWrapper);  // Append the imgWrapper, not the img directly

  // Tile Title
  const title = document.createElement('p');
  title.textContent = item.visuals.headline;
  tile.appendChild(title);

  return tile;
}

function focusTile() {
  // Remove focus from all tiles
  const allTiles = document.querySelectorAll('.tile');
  if (allTiles.length === 0) return; // No tiles to focus on

  allTiles.forEach(tile => tile.classList.remove('focused'));

  // Focus the new tile
  const tile = document.querySelector(`[data-row-index="${currentRow}"] [data-tile-index="${currentTile}"]`);
  if (tile) {
    tile.classList.add('focused');
    tile.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  }
}

function selectTile() {
  const tile = document.querySelector(`[data-row-index="${currentRow}"] [data-tile-index="${currentTile}"]`);
  if (tile) {
    const title = tile.querySelector('p'); // Assuming the title is inside a <p> element
    if (title) {
      alert(`Now Playing: ${title.textContent}`); // Display the title of the selected tile
    }
  }
}


function createSection(container: HTMLElement, collection: any, rowIndex: number) {
  const section = document.createElement('div');
  section.classList.add('section');

  // Collection Title (now above the row)
  const title = document.createElement('h2');
  title.textContent = collection.name;
  title.classList.add('row-title');
  section.appendChild(title);

  const row = document.createElement('div');
  row.classList.add('row');
  row.setAttribute('data-row-index', rowIndex.toString());

  // Loop through each item in the collection (e.g., "For You" items)
  collection.items.forEach((item: any, tileIndex: number) => {
    const tile = createVideoTile(item, rowIndex, tileIndex);
    row.appendChild(tile);
  });

  section.appendChild(row);
  container.appendChild(section); // Add both title and row to container
}

function renderView(data: any) {
  const app = document.querySelector<HTMLDivElement>('#app')!;
  const container = document.createElement('div');
  container.classList.add('hub-container');

  const promises = data.components.map((collection: any, rowIndex: number) => {
    if (!collection.items || collection.items.length === 0) {
      return fetchCollectionData(collection.href).then(fetchedCollection => {
        if (fetchedCollection && fetchedCollection.items.length > 0) {
          createSection(container, fetchedCollection, rowIndex);
        }
      });
    } else {
      createSection(container, collection, rowIndex);
    }
  });

  Promise.all(promises).then(() => {
    app.appendChild(container);
    // After all data has been loaded, focus the first tile
    focusTile();
  });
}

//Handles edge cases for api failures for example 
function renderErrorView() {
  const app = document.querySelector<HTMLDivElement>('#app')!;
  app.innerHTML = '';  // Clear any existing content

  const errorContainer = document.createElement('div');
  errorContainer.classList.add('error-container');

  const errorMessage = document.createElement('p');
  errorMessage.textContent = 'Something went wrong while loading the content. Please try refreshing or contact hulu support.';

  const retryButton = document.createElement('button');
  retryButton.textContent = 'Refresh';
  retryButton.classList.add('retry-button');

  // Retry fetching data on button click
  retryButton.onclick = () => {
    app.innerHTML = '';  // Clear the error message before retrying
    fetchHubData();  // Retry fetching the Hub data
  };

  errorContainer.appendChild(errorMessage);
  errorContainer.appendChild(retryButton);
  app.appendChild(errorContainer);
}


//Keyboard navigation
document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowRight':
      moveRight();
      break;
    case 'ArrowLeft':
      moveLeft();
      break;
    case 'ArrowUp':
      moveUp();
      break;
    case 'ArrowDown':
      moveDown();
      break;
    case 'Enter':
      selectTile();
      break;
  }
});

export function moveRight() {
  const tiles = document.querySelectorAll(`[data-row-index="${currentRow}"] .tile`);
  if (tiles.length === 0) return; // No tiles in the row
  if (currentTile < tiles.length - 1) {
    currentTile++;
    focusTile();
  }
}

export function moveLeft() {
  if (currentTile > 0) {
    currentTile--;
    focusTile();
  }
}

function moveUp() {
  if (currentRow > 0) {
    currentRow--;
    currentTile = 0; // Optional: Reset to first tile of the row
    focusTile();
  }
}

function moveDown() {
  const rows = document.querySelectorAll('.row');
  if (currentRow < rows.length - 1) {
    currentRow++;
    currentTile = 0; // Optional: Reset to first tile of the new row
    focusTile();
  }
}
//Load view on render
fetchHubData();
