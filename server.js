const http = require('http');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Post = require('./models/post');

dotenv.config({ path: "./.env" })
let url = process.env.DATABASE;
const dbName = "metaWall-test";
url = url.replace("<password>", process.env.DATABASE_PASSWORD)
url = url.replace("<dbName>", dbName)

mongoose
    .connect(url)
    .then(() => console.log('資料庫連接成功'))
    .catch(error => console.log(error));

const requestListener = async (req, res) => {
    let body = "";
    req.on("data", chunk => body += chunk);

    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
        'Content-Type': 'application/json'
    }

    const showPosts = async () => {
        const posts = await Post.find();
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "status": "success",
            posts
        }))
        res.end();
    }

    const handleError = err => {
        console.log(err);
        let error;
        [...Object.keys(err.errors)].forEach(el =>
            error = err.errors[el].properties?.message ?
                { ...error, [el]: err.errors[el].properties.message } :
                { ...error, [el]: err.errors[el].message }
        );
        res.writeHead(400, headers);
        res.write(JSON.stringify({
            "status": "false",
            error
        }))
        res.end();
    }

    const getId = path => path.split("/").pop();

    const handleParam = () => {
        const data = JSON.parse(body);
        let newData;
        [...Object.keys(data)].forEach(field => {
            newData = { ...newData, [field]: data[field] }
        })
        return newData;
    }

    if (req.url == "/posts" && req.method == "GET") {
        showPosts();
    } else if (req.url == "/posts" && req.method == "POST") {
        req.on('end', async () => {
            try {
                const data = handleParam();
                Post.create(data)
                    .then(async (result) => {
                        showPosts();
                    }).catch(error => {
                        handleError(error)
                    });
            } catch (error) {
                handleError(error);
            }
        })
    } else if (req.url == "/posts" && req.method == "DELETE") {
        await Post.deleteMany({});
        showPosts();
    } else if (req.url.startsWith("/posts/") && req.method == "DELETE") {
        const id = getId(req.url);
        await Post.findByIdAndDelete(id)
            .then(async (result) => {
                showPosts();
            }).catch(error => {
                handleError(error)
            });
    } else if (req.url.startsWith("/posts/") && req.method === "PATCH") {
        req.on('end', async () => {
            try {
                const id = getId(req.url);
                const data = handleParam();
                await Post.findByIdAndUpdate(id, data)
                    .then(async (result) => {
                        showPosts();
                    }).catch(error => {
                        handleError(error)
                    });
            } catch (error) {
                handleError(error);
            }
        })
    } else {
        res.writeHead(404, headers);
        res.write(JSON.stringify({
            "status": "false",
            "message": "無此網站路由"
        }))
        res.end();
    }
}

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3000);