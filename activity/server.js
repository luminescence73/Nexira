import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
const root = resolve('dist');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
const port = Number(process.env.PORT || 3000);
createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const path = resolve(root,'.'+pathname);
    if (path !== root && !path.startsWith(root+sep)) {res.writeHead(403);res.end('Forbidden');return;}
    const file = (await stat(path).catch(()=>null))?.isFile() ? path : resolve(root,'index.html');
    const data = await readFile(file);
    res.writeHead(200,{'Content-Type':types[extname(file)] || 'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(data);
  } catch (error) {console.error(error);res.writeHead(500);res.end('Server error');}
}).listen(port,'0.0.0.0',()=>console.log('Nexix Connect Activity listening on '+port));
