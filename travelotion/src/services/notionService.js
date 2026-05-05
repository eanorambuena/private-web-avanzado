import { Client } from '@notionhq/client'
import dotenv from 'dotenv'

dotenv.config()

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

const databaseId = process.env.NOTION_DATABASE_ID

export async function createPage(properties) {
  const response = await notion.pages.create({
    parent: { database_id: databaseId },
    properties,
  })
  return response
}

export async function getPages() {
  const response = await notion.databases.query({
    database_id: databaseId,
  })
  return response.results
}

export async function getPage(pageId) {
  const response = await notion.pages.retrieve({
    page_id: pageId,
  })
  return response
}

export async function updatePage(pageId, properties) {
  const response = await notion.pages.update({
    page_id: pageId,
    properties,
  })
  return response
}

export async function deletePage(pageId) {
  const response = await notion.blocks.delete({
    block_id: pageId,
  })
  return response
}

export async function queryDatabase(filter) {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter,
  })
  return response.results
}

export default notion