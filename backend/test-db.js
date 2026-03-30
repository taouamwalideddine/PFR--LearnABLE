const { Client } = require('pg');

async function testQuery() {
    const client = new Client({
        user: 'postgres',
        password: '1111',
        host: 'localhost',
        port: 5432,
        database: 'learnAble_db',
    });

    try {
        await client.connect();

        const resUsers = await client.query('SELECT * FROM users');
        console.log('--- Table: users ---');
        console.log(resUsers.rows);

        const resUser = await client.query('SELECT * FROM "User"');
        console.log('\n--- Table: User ---');
        console.log(resUser.rows);

    } catch (err) {
        console.error('Error querying:', err.message);
    } finally {
        await client.end();
    }
}

testQuery();
