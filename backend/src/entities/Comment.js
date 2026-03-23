const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Comment',
    tableName: 'comments',
    columns: {
        id: {
            primary: true,
            type: 'uuid',
            generated: 'uuid',
        },
        content: {
            type: 'text',
        },
        likes: {
            type: 'int',
            default: 0,
        },
        authorId: {
            type: 'uuid',
        },
        postId: {
            type: 'uuid',
        },
        createdAt: {
            type: 'timestamp',
            createDate: true,
        },
    },
    relations: {
        author: {
            type: 'many-to-one',
            target: 'User',
            joinColumn: { name: 'authorId' },
            inverseSide: 'comments',
        },
        post: {
            type: 'many-to-one',
            target: 'Post',
            joinColumn: { name: 'postId' },
            inverseSide: 'comments',
        },
    },
});
