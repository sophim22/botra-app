import app from "./app";
import listEndpoints from "express-list-endpoints";
import Table from "cli-table";

const routes = listEndpoints(app);
const table = new Table({
  head: ["METHOD", "PATH"]
});
routes.map(route => {
  table.push([route.methods, route.path]);
});
console.log(table.toString());
process.exit();
