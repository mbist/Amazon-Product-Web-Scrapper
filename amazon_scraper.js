const puppeteer = require('puppeteer');
const prompt = require('prompt-sync')();

async function scrapeAmazon(searchTerm) {
    // Launch headless browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to Amazon.in
    await page.goto(`https://www.amazon.in/s?k=${encodeURIComponent(searchTerm)}`);

    // Wait for search results to load
    await page.waitForSelector('div[data-component-type="s-search-result"]');

    // Extract data from search results
    const products = await page.evaluate(() => {
        const productNodes = document.querySelectorAll('div[data-component-type="s-search-result"]');
        const productList = [];

        productNodes.forEach(node => {
            const productName = node.querySelector('span.a-text-normal').innerText;
            const sponsoredOrder = node.querySelector('span[data-component-type="sp-sponsored-result"]') ? node.querySelector('span[data-component-type="sp-sponsored-result"]').innerText.trim() : null;
            const price = node.querySelector('span.a-price-whole').innerText;
            const asinMatch = node.querySelector('a').getAttribute('href').match(/\/dp\/([^\/]+)/);
            const asin = asinMatch ? asinMatch[1] : null;
            productList.push({ productName, sponsoredOrder, price, asin });
        });

        return productList;
    });

    // Close browser
    await browser.close();

    // Return the extracted data
    return products;
}

async function run() {
    const searchTerm = prompt('Enter the search term for Amazon.in: ');
    const products = await scrapeAmazon(searchTerm);
    console.log(JSON.stringify(products, null, 2));
}

run();
