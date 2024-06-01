const searchInput = document.getElementById('search');
const resultsDiv = document.getElementById('results');

// Load JSON data
async function fetchData() {
  const files = ['stream1.json', 'stream2.json']; // Add all your JSON file names here
  const promises = files.map(file => fetch(`streams/${file}`).then(response => response.json()));
  const data = await Promise.all(promises);
  return data;
}

// Display search results
function displayResults(results) {
  resultsDiv.innerHTML = '';
  results.forEach(result => {
    const div = document.createElement('div');
    div.innerHTML = `<h3>${result.title}</h3><p>${result.date}</p><ul>${
      result.timestamps.map(ts => `<li>${ts.time} - ${ts.description}</li>`).join('')
    }</ul>`;
    resultsDiv.appendChild(div);
  });
}

// Filter data based on search input
function filterData(data, query) {
  return data.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.timestamps.some(ts => ts.description.toLowerCase().includes(query.toLowerCase()))
  );
}

// Event listener for search input
searchInput.addEventListener('input', async () => {
  const query = searchInput.value;
  const data = await fetchData();
  const filteredData = filterData(data.flat(), query); // Flatten the array of arrays
  displayResults(filteredData);
});

// Initial fetch and display of data
(async () => {
  const data = await fetchData();
  displayResults(data.flat()); // Flatten the array of arrays
})();

