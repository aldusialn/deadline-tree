// lib/db/neo4j.ts
import neo4j, { Driver } from 'neo4j-driver'

let driver: Driver | null = null

function getDriver(): Driver {
  if (!driver) {
    driver = neo4j.driver(
      process.env.NEO4J_URI!,
      neo4j.auth.basic(
        process.env.NEO4J_USER!,
        process.env.NEO4J_PASSWORD!
      ),
      {
        maxConnectionPoolSize: 50,
        connectionAcquisitionTimeout: 2000,
      }
    )
  }
  return driver
}

// Graceful shutdown (optional but good practice)
process.on('exit', async () => {
  if (driver) {
    await driver.close()
  }
})

export default getDriver()