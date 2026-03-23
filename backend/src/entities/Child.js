const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Child',
    tableName: 'children',
    columns: {
        id: {
            primary: true,
            type: 'uuid',
            generated: 'uuid',
        },
        name: {
            type: 'varchar',
        },
        age: {
            type: 'int',
        },
        sensoryPreferences: {
            type: 'jsonb',
            nullable: true,
        },
        learningPace: {
            type: 'varchar',
            nullable: true,
        },
        difficultyLevel: {
            type: 'int',
            default: 1,
        },
        parentId: {
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
        parent: {
            type: 'many-to-one',
            target: 'User',
            joinColumn: { name: 'parentId' },
            inverseSide: 'children',
        },
        progress: {
            type: 'one-to-many',
            target: 'Progress',
            inverseSide: 'child',
        },
        rewards: {
            type: 'one-to-many',
            target: 'Reward',
            inverseSide: 'child',
        },
        lessons: {
            type: 'many-to-many',
            target: 'Lesson',
            joinTable: {
                name: 'child_lessons',
                joinColumn: {
                    name: 'childId',
                    referencedColumnName: 'id'
                },
                inverseJoinColumn: {
                    name: 'lessonId',
                    referencedColumnName: 'id'
                }
            },
        },
    },
});
