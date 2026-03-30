const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'User',
    tableName: 'users',
    columns: {
        id: {
            primary: true,
            type: 'uuid',
            generated: 'uuid',
        },
        email: {
            type: 'varchar',
            unique: true,
        },
        password: {
            type: 'varchar',
        },
        role: {
            type: 'varchar',
            default: 'PARENT', 
        },
        createdAt: {
            type: 'timestamp',
            createDate: true,
        },
        updatedAt: {
            type: 'timestamp',
            updateDate: true,
        },
    },
    relations: {
        children: {
            type: 'one-to-many',
            target: 'Child',
            inverseSide: 'parent',
        },
    },
});
