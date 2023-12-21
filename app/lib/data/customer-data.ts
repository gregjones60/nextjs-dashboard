import {sql} from '@vercel/postgres';
import {CustomersTableType,} from '../definitions';
import {unstable_noStore as noStore} from 'next/cache';

export async function fetchCustomers() {
    noStore();

    try {
        const customers = await sql<CustomersTableType>`
      SELECT
        customers.id,
        customers.name,
        customers.email,
        customers.image_url
      FROM customers
    `;

        return customers.rows;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch customers.');
    }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredCustomers(
    query: string,
    currentPage: number,
) {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;
    noStore();

    try {
        const customers = await sql<CustomersTableType>`
      SELECT
        customers.id,
        customers.name,
        customers.email,
        customers.image_url
      FROM customers
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
      ORDER BY customers.name ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

        return customers.rows;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch customers.');
    }
}

export async function fetchCustomersPages(query: string) {
    noStore();
    try {
        const count = await sql`SELECT COUNT(*)
    FROM customers
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`}
  `;

        const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
        return totalPages;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch total number of customers.');
    }
}

export async function fetchCustomerById(id: string) {
    noStore();
    try {
        const data = await sql<CustomersTableType>`
      SELECT
        customers.id,
        customers.name,
        customers.email,
        customers.image_url
      FROM customers
      WHERE customers.id = ${id};
    `;

        const customer = data.rows.map((customer) => ({
            ...customer
        }));

        return customer[0];
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch customer.');
    }
}
