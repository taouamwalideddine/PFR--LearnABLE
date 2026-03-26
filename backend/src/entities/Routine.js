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
            // e.g. "Morning Routine", "Bedtime", "School Day"
        },
        description: {
            type: 'text',
            nullable: true,
        },
        category: {
            type: 'varchar',
            default: 'DAILY', // DAILY, SPECIAL_EVENT, WEEKEND
        },
        childId: {
            type: 'uuid',
        },
        creatorId: {
            type: 'uuid', // The parent or educator who made it
        },
        isActive: {
            type: 'boolean',
            default: false, // Is this routine currently assigned to today?
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
        child: {
            type: 'many-to-one',
            target: 'Child',
            joinColumn: { name: 'childId' },
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
