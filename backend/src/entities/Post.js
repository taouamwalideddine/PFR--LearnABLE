const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Post',
    tableName: 'posts',
    columns: {
        id: {
            primary: true,
            type: 'uuid',
            generated: 'uuid',
        },
        title: {
            type: 'varchar',
        },
        content: {
            type: 'text',
        },
        category: {
            type: 'varchar',
            nullable: true,
        },
        likes: {
            type: 'int',
            default: 0,
        },
        isReported: {
            type: 'boolean',
            default: false,
        },
        authorId: {
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
        author: {
            type: 'many-to-one',
            target: 'User',
            joinColumn: { name: 'authorId' },
            inverseSide: 'posts',
        },
        comments: {
            type: 'one-to-many',
            target: 'Comment',
            inverseSide: 'post',
        },
    },
});
