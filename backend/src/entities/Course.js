const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Course',
    tableName: 'courses',
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
            default: 'GENERAL',
        },
        bannerUrl: {
            type: 'varchar',
            nullable: true,
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
        modules: {
            type: 'one-to-many',
            target: 'Module',
            inverseSide: 'course',
            cascade: true,
        },
    },
});
