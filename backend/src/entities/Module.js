const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Module',
    tableName: 'modules',
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
        orderIndex: {
            type: 'int',
            default: 0,
        },
        courseId: {
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
        course: {
            type: 'many-to-one',
            target: 'Course',
            joinColumn: { name: 'courseId' },
            inverseSide: 'modules',
            onDelete: 'CASCADE',
        },
        lessons: {
            type: 'one-to-many',
            target: 'Lesson',
            inverseSide: 'module',
            cascade: true,
        },
    },
});
