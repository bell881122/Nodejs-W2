const http = require('http');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { headers } = require('./utils/utils');
const postController = require('./controllers/postsController');

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

    const id = req.url.split("/").pop();

    req.on('end', () => {
        if (req.url == "/posts" && req.method == "GET") {
            postController.getPosts(res);
        } else if (req.url == "/posts" && req.method == "POST") {
            postController.addPost(res, body);
        } else if (req.url == "/posts" && req.method == "DELETE") {
            postController.deletePosts(res);
        } else if (req.url.startsWith("/posts/") && req.method == "DELETE") {
            postController.deletePost(res, id);
        } else if (req.url.startsWith("/posts/") && req.method === "PATCH") {
            postController.updatePost(res, id, body);
        } else {
            res.writeHead(404, headers);
            res.write(JSON.stringify({
                "status": "false",
                "message": "無此網站路由"
            }))
            res.end();
        }
    })
}

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3000);