'use server';

import {z} from 'zod';
import {sql} from '@vercel/postgres';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';

const FormSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    image_url: z.string(),
});

const CreateCustomer = FormSchema.omit({id: true});

// This is temporary until @types/react-dom is updated
export type State = {
    errors?: {
        name?: string[];
        email?: string[];
        image_url?: string[];
    };
    message?: string | null;
};

export async function createCustomer(prevState: State, formData: FormData) {
    // Validate form using Zod
    const validatedFields = CreateCustomer.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        image_url: formData.get('image_url'),
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Customer.',
        };
    }

    // Prepare data for insertion into the database
    const {name, email, image_url} = validatedFields.data;

    // Insert data into the database
    try {
        await sql`
            INSERT INTO customers (name, email, image_url)
            VALUES (${name}, ${email}, ${image_url})
        `;
    } catch (error) {
        // If a database error occurs, return a more specific error.
        return {
            message: 'Database Error: Failed to Create Customer.',
        };
    }

    // Revalidate the cache for the customers page and redirect the user.
    revalidatePath('/dashboard/customers');
    redirect('/dashboard/customers');
}

const UpdateCustomer = FormSchema.omit({id: true, date: true});

export async function updateCustomer(id: string, prevState: State, formData: FormData) {
    const validatedFields = UpdateCustomer.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        image_url: formData.get('image_url'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Update Customer.',
        };
    }

    const {name, email, image_url} = validatedFields.data;

    try {
        await sql`
            UPDATE customers
            SET name = ${name},
                email       = ${email},
                image_url   = ${image_url}
            WHERE id = ${id}
        `;
    } catch (error) {
        return {message: 'Database Error: Failed to Update Customer.'};
    }

    revalidatePath('/dashboard/customers');
    redirect('/dashboard/customers');
}

export async function deleteCustomer(id: string) {

    try {
        await sql`DELETE
                  FROM customers
                  WHERE id = ${id}`;
        revalidatePath('/dashboard/customers');
        return {message: 'Deleted Customer.'};
    } catch (error) {
        return {
            message: 'Database Error: Failed to Delete Customer.',
        };
    }
}
