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
        moduleId: {
            type: 'uuid',
            nullable: true,
        },
        orderIndex: {
            type: 'int',
            default: 0,
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
        module: {
            type: 'many-to-one',
            target: 'Module',
            joinColumn: { name: 'moduleId' },
            inverseSide: 'lessons',
            onDelete: 'CASCADE',
        },
        activities: {
            type: 'one-to-many',
            target: 'Activity',
            inverseSide: 'lesson',
            cascade: true,
        },
        children: {
            type: 'many-to-many',
            target: 'Child',
            // The join table is defined in the Child entity
        },
    },
});
