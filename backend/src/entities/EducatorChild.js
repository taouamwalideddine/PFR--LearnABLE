const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'EducatorChild',
    tableName: 'educator_children',
    columns: {
        id: {
            primary: true,
            type: 'uuid',
            generated: 'uuid',
        },
        educatorId: {
            type: 'uuid',
        },
        childId: {
            type: 'uuid',
        },
        grantedAt: {
            type: 'timestamp',
            createDate: true,
        },
    },
    relations: {
        educator: {
            type: 'many-to-one',
            target: 'User',
            joinColumn: { name: 'educatorId' },
        },
        child: {
            type: 'many-to-one',
            target: 'Child',
            joinColumn: { name: 'childId' },
        },
    },
});
