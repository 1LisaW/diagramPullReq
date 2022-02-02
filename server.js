const http = require('http');
const serveStatic = require('serve-static');
const serve = serveStatic('./');

const listenHttp = (req,res) => {
    serve(req,res,()=>{
      req.url='/main.html';
    });
  // console.log(res);  
}
const server = http.createServer(listenHttp);
server.listen(3000);