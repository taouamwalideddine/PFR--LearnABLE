const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Activity',
    tableName: 'activities',
    columns: {
        id: {
            primary: true,
            type: 'uuid',
            generated: 'uuid',
        },
        title: {
            type: 'varchar',
        },
        type: {
            type: 'varchar',
        },
        content: {
            type: 'jsonb',
        },
        lessonId: {
            type: 'uuid',
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
        lesson: {
            type: 'many-to-one',
            target: 'Lesson',
            joinColumn: { name: 'lessonId' },
            inverseSide: 'activities',
        },
        progress: {
            type: 'one-to-many',
            target: 'Progress',
            inverseSide: 'activity',
        },
    },
});
