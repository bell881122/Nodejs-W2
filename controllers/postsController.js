const Post = require('../models/post');
const { handleParam, handleError, showPosts } = require('../utils/utils');

const getPosts = res => {
    showPosts(res);
}

const addPost = async (res, body) => {
    try {
        const data = handleParam(body);
        await Post.create(data)
            .then(async (result) => {
                showPosts(res);
            }).catch(error => {
                handleError(error, res)
            });
    } catch (error) {
        handleError(error, res);
    }
};

const deletePosts = async res => {
    await Post.deleteMany({});
    showPosts(res);
};

const deletePost = async (res, id) => {
    await Post.findByIdAndDelete(id)
        .then(async (result) => {
            if (result === null)
                handleError({ "message": "Id 有誤，請重新確認" }, res)
            showPosts(res);
        }).catch(error => {
            console.log(error)
            handleError(error, res)
        });
};

const updatePost = async (res, id, body) => {
    try {
        const data = handleParam(body);
        await Post.findByIdAndUpdate(id, data, { runValidators: true })
            .then(async (result) => {
                if (result === null)
                    handleError({ "message": "Id 有誤，請重新確認" }, res)
                showPosts(res);
            }).catch(error => {
                handleError(error, res)
            });
    } catch (error) {
        handleError(error, res);
    }
};

module.exports = { getPosts, addPost, deletePosts, deletePost, updatePost };