const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'AccessCode',
    tableName: 'access_codes',
    columns: {
        id: {
            primary: true,
            type: 'uuid',
            generated: 'uuid',
        },
        code: {
            type: 'varchar',
            unique: true,
        },
        childId: {
            type: 'uuid',
        },
        parentId: {
            type: 'uuid', 
        },
        redeemedBy: {
            type: 'uuid',
            nullable: true, 
        },
        expiresAt: {
            type: 'timestamp',
        },
        isUsed: {
            type: 'boolean',
            default: false,
        },
        createdAt: {
            type: 'timestamp',
            createDate: true,
        },
    },
    relations: {
        child: {
            type: 'many-to-one',
            target: 'Child',
            joinColumn: { name: 'childId' },
        },
        parent: {
            type: 'many-to-one',
            target: 'User',
            joinColumn: { name: 'parentId' },
        },
    },
});
