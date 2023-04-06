import app, { port } from "./app";
import redis from "./config/redis";

const server = app.listen(port, async () => {
  await redis.connect();
  global.redis = redis;

  console.log(`Server is running on port: ${port}`);
});

server.on("close", () => {
  console.log("Closed express server");

  db.pool.end(() => {
    console.log("Shut down connection pool");
  });
});