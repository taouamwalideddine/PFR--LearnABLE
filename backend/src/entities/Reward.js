const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Reward',
    tableName: 'rewards',
    columns: {
        id: {
            primary: true,
            type: 'uuid',
            generated: 'uuid',
        },
        name: {
            type: 'varchar',
        },
        type: {
            type: 'varchar',
        },
        reason: {
            type: 'text',
            nullable: true,
        },
        childId: {
            type: 'uuid',
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
            inverseSide: 'rewards',
        },
    },
});
