const Post = require('../models/post');

const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json'
}

const handleParam = body => {
    const data = JSON.parse(body);
    let newData;
    [...Object.keys(data)].forEach(field => {
        newData = { ...newData, [field]: data[field] }
    })
    return newData;
}

const handleError = (err, res) => {
    let error;
    if (err.errors) {
        [...Object.keys(err.errors)].forEach(el =>
            error = err.errors[el].properties?.message ?
                { ...error, [el]: err.errors[el].properties.message } :
                { ...error, [el]: err.errors[el].message }
        );
    }
    else {
        error = err;
    }
    res.writeHead(400, headers);
    res.write(JSON.stringify({
        "status": "false",
        error
    }))
    res.end();
}

const showPosts = async res => {
    const posts = await Post.find();
    res.writeHead(200, headers);
    res.write(JSON.stringify({
        "status": "success",
        posts
    }))
    res.end();
}

module.exports = { headers, handleParam, handleError, showPosts };