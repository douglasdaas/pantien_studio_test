import fetch from 'cross-fetch'
import taxRates from './data/taxRate.json'

/**
 * Get site titles of cool websites.
 *
 * Task: Can we change this to make the requests async, so they are all fetched at once then when they are done, return all
 * the titles and make this function faster?
 *
 * @returns array of strings
 */
export async function returnSiteTitles() {
  const urls = [
    'https://patientstudio.com/',
    'https://www.startrek.com/',
    'https://www.starwars.com/',
    'https://www.neowin.net/'
  ]

  return Promise.all(
    urls.map(async url => {
      const response = await fetch(url, { method: 'GET' })

      if (response.status === 200) {
        const data = await response.text()
        const match = data.match(/<title>(.*?)<\/title>/)
        if (match?.length) {
          return match[1]
        }
      }
      return 'Error fetching the data'
    })
  )
}

/**
 * Count the tags and organize them into an array of objects.
 *
 * Task: That's a lot of loops; can you refactor this to have the least amount of loops possible.
 * The test is also failing for some reason.
 *
 * @param localData array of objects
 * @returns array of objects
 */
export function findTagCounts(localData: Array<SampleDateRecord>): Array<TagCounts> {
  const tagCounts: Array<TagCounts> = []
  const indexMap = new Map<string, number>()

  localData.forEach(element => {
    element.tags.forEach(tagElement => {
      if (indexMap.has(tagElement)) {
        // Already checking if the country is in the map, in the 'if' above.
        // Without the non-null assertion the compiler throw an error of
        // "Type 'undefined' cannot be used as an index type." on lines 57.
        // It's a curren design limitation of typescript with Maps objects.
        // https://stackoverflow.com/questions/70723319/object-is-possibly-undefined-using-es6-map-get-right-after-map-set

        tagCounts[indexMap.get(tagElement)!].count += 1
      } else {
        tagCounts.push({ tag: tagElement, count: 1 })
        indexMap.set(tagElement, tagCounts.length - 1)
      }
    })
  })

  return tagCounts
}

/**
 * Calculate total price
 *
 * Task: Write a function that reads in data from `importedItems` array (which is imported above) and calculates the total price, including taxes based on each
 * country's tax rate.
 *
 * Here are some useful formulas and information:
 *  - import cost = unit price * quantity * importTaxRate
 *  - total cost = import cost + (unit price * quantity)
 *  - the "importTaxRate" is based on they destination country
 *  - if the imported item is on the "category exceptions" list, then no tax rate applies
 *
 * @param importedItems array of objects
 * @returns array of objects
 */
export function calculateImportCost(importedItems: Array<ImportedItem>): Array<ImportCostOutput> {
  const importedCostItems: Array<ImportCostOutput> = []
  const importTaxRateMap = new Map<string, ImportTaxRate>()

  function getImportCost(unitPrice: number, quantity: number, countryDestination: string, category: string): number {
    if (!importTaxRateMap.has(countryDestination)) {
      // throw new Error('Country tax rate unavailable')
      return 0
    }
    // Already checking if the country is in the map, in the 'if' above.
    // Without the non-null assertion the compiler throw an error of
    // "Object is possibly 'undefined'." on lines 93 and 98.
    // It's a curren design limitation of typescript with Maps objects.
    // https://stackoverflow.com/questions/70723319/object-is-possibly-undefined-using-es6-map-get-right-after-map-set

    const countryTaxRateInfo = importTaxRateMap.get(countryDestination)!

    for (const categoryException of countryTaxRateInfo.categoryExceptions) {
      if (categoryException === category) {
        return 0
      }
    }

    return unitPrice * quantity * countryTaxRateInfo.importTaxRate
  }

  // Fill the map with data
  taxRates.forEach(taxRateInfo => {
    if (!importTaxRateMap.has(taxRateInfo.country)) {
      importTaxRateMap.set(taxRateInfo.country, taxRateInfo)
    }
  })

  // Make tax rate calculation
  importedItems.forEach(item => {
    const { name, unitPrice, quantity, countryDestination, category } = item
    const importCost = getImportCost(unitPrice, quantity, countryDestination, category)

    const subtotal = quantity * unitPrice

    const ItemCalculated: ImportCostOutput = {
      name,
      subtotal,
      importCost,
      totalCost: subtotal + importCost
    }

    importedCostItems.push(ItemCalculated)
  })

  return importedCostItems
}
