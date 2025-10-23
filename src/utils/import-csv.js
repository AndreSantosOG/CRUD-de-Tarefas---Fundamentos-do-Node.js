import { parse } from "csv-parse";
import fs from "node:fs";
import http from "node:http";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const csvFilePath = resolve(__dirname, "tasks.csv");

async function sendTask(title, description) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ title, description });

    const options = {
      hostname: "localhost",
      port: 3333,
      path: "/tasks",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 201) {
        console.log(`Tarefa criada: ${title}`);
        resolve();
      } else {
        console.error(`Erro ao criar "${title}": ${res.statusCode}`);
        reject();
      }
    });

    req.on("error", (err) => {
      console.error("Erro na requisição:", err.message);
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

async function importCSV() {
  const stream = fs.createReadStream(csvFilePath);

  const parser = parse({
    delimiter: ",",
    from_line: 2,
    trim: true,
  });

  stream.pipe(parser);

  for await (const record of parser) {
    const [title, description] = record;

    if (!title || !description) {
      console.warn(`Linha inválida ignorada: ${record}`);
      continue;
    }

    await sendTask(title, description);
  }

  console.log("\n Importação finalizada!");
}

importCSV().catch((err) => console.error("Erro na importação:", err));
