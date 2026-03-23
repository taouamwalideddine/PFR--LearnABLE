const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Lesson',
    tableName: 'lessons',
    columns: {
        id: {
            primary: true,
            type: 'uuid',
            generated: 'uuid',
        },
        title: {
            type: 'varchar',
        },
        category: {
            type: 'varchar',
        },
        description: {
            type: 'text',
            nullable: true,
        },
        difficulty: {
            type: 'int',
            default: 1,
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
        activities: {
            type: 'one-to-many',
            target: 'Activity',
            inverseSide: 'lesson',
        },
        children: {
            type: 'many-to-many',
            target: 'Child',
            // The join table is defined in the Child entity
        },
    },
});
