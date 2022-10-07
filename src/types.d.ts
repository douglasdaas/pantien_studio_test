interface SampleDateRecord {
  _id: string
  index: number
  guid: string
  isActive: boolean
  balance: string
  picture: string
  age: number
  eyeColor: string
  name: string
  gender: string
  company: string
  email: string
  phone: string
  address: string
  about: string
  registered: string
  latitude: number
  longitude: number
  tags: string[]
  friends: Friend[]
}

interface Friend {
  id: number
  name: string
}

interface TagCounts {
  tag: string
  count: number
}

interface ImportedItem {
  name: string
  unitPrice: number
  quantity: number
  countryDestination: string
  countryOrigin: string
  category: string
}

interface ImportTaxRate {
  country: string
  importTaxRate: number
  categoryExceptions: string[]
}

interface ImportCostOutput {
  name: string
  subtotal: number
  importCost: number
  totalCost: number
}
