const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Message',
    tableName: 'messages',
    columns: {
        id: {
            primary: true,
            type: 'uuid',
            generated: 'uuid',
        },
        content: {
            type: 'text',
        },
        senderId: {
            type: 'uuid',
        },
        receiverId: {
            type: 'uuid',
        },
        childId: {
            type: 'uuid', // Messages are grouped per-child context
        },
        readAt: {
            type: 'timestamp',
            nullable: true,
        },
        createdAt: {
            type: 'timestamp',
            createDate: true,
        },
    },
    relations: {
        sender: {
            type: 'many-to-one',
            target: 'User',
            joinColumn: { name: 'senderId' },
        },
        receiver: {
            type: 'many-to-one',
            target: 'User',
            joinColumn: { name: 'receiverId' },
        },
        child: {
            type: 'many-to-one',
            target: 'Child',
            joinColumn: { name: 'childId' },
        },
    },
});
