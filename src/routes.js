import { randomUUID } from "node:crypto";
import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query;

      const tasks = database.select(
        "tasks",
        search
          ? {
              title: search,
              description: search,
            }
          : null
      );

      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body;

      const user = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      database.insert("tasks", user);

      return res.writeHead(201).end();
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      const [task] = database.select("tasks", { id });
      if (!task) {
        return res.writeHead(404).end("Task não encontrada");
      }

      const updatedTask = {
        ...task,
        title: title ?? task.title, 
        description: description ?? task.description,
        updated_at: new Date().toISOString(),
      };

      database.update("tasks", id, updatedTask);

      return res.writeHead(204).end();
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params;
      const [task] = database.select("tasks", { id });
      if (!task) {
        return res.writeHead(404).end("Task não encontrada");
      }
      if (task.completed_at) {
        return res.writeHead(400).end("A task já foi concluída");
      }
       const updatedTask = {
        ...task,
        completed_at: new Date().toISOString()
      };
      database.update("tasks", id,  updatedTask );

      return res.writeHead(204).end();
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const [task] = database.select("tasks", { id });
      if (!task) {
        return res.writeHead(404).end("Task não encontrada");
      }
      database.delete("tasks", id);

      return res.writeHead(204).end();
    },
  },
];
