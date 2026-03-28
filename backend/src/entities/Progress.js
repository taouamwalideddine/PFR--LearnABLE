const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Progress',
    tableName: 'progresses',
    columns: {
        id: {
            primary: true,
            type: 'uuid',
            generated: 'uuid',
        },
        childId: {
            type: 'uuid',
        },
        activityId: {
            type: 'uuid',
        },
        completed: {
            type: 'boolean',
            default: false,
        },
        successRate: {
            type: 'float',
            default: 0,
        },
        timeSpent: {
            type: 'int',
            default: 0,
        },
        timestamp: {
            type: 'timestamp',
            createDate: true,
        },
    },
    relations: {
        child: {
            type: 'many-to-one',
            target: 'Child',
            joinColumn: { name: 'childId' },
            inverseSide: 'progress',
            onDelete: 'CASCADE',
        },
        activity: {
            type: 'many-to-one',
            target: 'Activity',
            joinColumn: { name: 'activityId' },
            inverseSide: 'progress',
            onDelete: 'CASCADE',
        },
    },
});
