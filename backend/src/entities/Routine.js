const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Routine',
    tableName: 'routines',
    columns: {
        id: {
            primary: true,
            type: 'uuid',
            generated: 'uuid',
        },
        title: {
            type: 'varchar',
        },
        description: {
            type: 'text',
            nullable: true,
        },
        category: {
            type: 'varchar',
            default: 'DAILY',
        },
        creatorId: {
            type: 'uuid', //parent/educator
        },
        isActive: {
            type: 'boolean',
            default: false, //is assigned and active
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
            type: 'many-to-many',
            target: 'Child',
            inverseSide: 'routines',
        },
        creator: {
            type: 'many-to-one',
            target: 'User',
            joinColumn: { name: 'creatorId' },
        },
        steps: {
            type: 'one-to-many',
            target: 'RoutineStep',
            inverseSide: 'routine',
            cascade: true,
        },
    },
});
