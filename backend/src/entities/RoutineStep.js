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
            // e.g. "Brush Teeth", "Put on Shoes"
        },
        description: {
            type: 'text',
            nullable: true,
        },
        imageUrl: {
            type: 'varchar',
            nullable: true,
            // Very important for visual thinkers!
        },
        durationMinutes: {
            type: 'int',
            nullable: true,
            // Time limit/expectation
        },
        orderIndex: {
            type: 'int',
            default: 0,
            // Sequence in the timeline
        },
        type: {
            type: 'varchar',
            default: 'CUSTOM', // CUSTOM, LESSON (if it links to a curriculum lesson)
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
