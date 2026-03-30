const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'RoutineStep',
    tableName: 'routine_steps',
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
        imageUrl: {
            type: 'varchar',
            nullable: true,
        },
        durationMinutes: {
            type: 'int',
            nullable: true,
        },
        orderIndex: {
            type: 'int',
            default: 0,
        },
        type: {
            type: 'varchar',
            default: 'CUSTOM', 
        },
        linkedLessonId: {
            type: 'uuid',
            nullable: true,
        },
        routineId: {
            type: 'uuid',
        },
    },
    relations: {
        routine: {
            type: 'many-to-one',
            target: 'Routine',
            joinColumn: { name: 'routineId' },
            onDelete: 'CASCADE',
        },
    },
});
