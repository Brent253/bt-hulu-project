import './style.css'

// Fetch api data
async function fetchHubData() {
  const res = await fetch('https://d1q0vy0v52gyjr.cloudfront.net/hub.json');
  const data = await res.json();

  //Render view of page 
  renderView(data);
}

// Fetch data for individual collections
async function fetchCollectionData(href: string): Promise<any> {
  const res = await fetch(href);
  return res.json();
}

// Add keyboard navigation
let currentRow = 0;
let currentTile = 0;

function createTile(item: any, rowIndex: number, tileIndex: number): HTMLElement {
  const tile = document.createElement('div');
  tile.classList.add('tile');
  tile.setAttribute('data-row-index', rowIndex.toString());
  tile.setAttribute('data-tile-index', tileIndex.toString());

  // Image for the tile
  const imgWrapper = document.createElement('div');
  imgWrapper.classList.add('img-wrapper');

  const img = document.createElement('img');
  img.src = `${item.visuals.artwork.horizontal_tile.image.path}&size=400x300&format=jpeg`;
  img.alt = item.visuals.headline || 'No Title';
  
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
    const tile = createTile(item, rowIndex, tileIndex);
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

// Add keyboard navigation
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

function moveRight() {
  const tiles = document.querySelectorAll(`[data-row-index="${currentRow}"] .tile`);
  if (tiles.length === 0) return; // No tiles in the row
  if (currentTile < tiles.length - 1) {
    currentTile++;
    focusTile();
  }
}

function moveLeft() {
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
      alert(`Tile Selected: ${title.textContent}`); // Display the title of the selected tile
    }
  }
}

fetchHubData();
