import { createStream } from "rotating-file-stream";
import winston, { format } from "winston";

const pad = (num) => (num > 9 ? "" : "0") + num;
const generator = (time, index) => {
  if (!time) return "./logs/access.log";

  const month = time.getFullYear() + "" + pad(time.getMonth() + 1);
  const day = pad(time.getDate());

  return `./logs/${`${time.getFullYear()}-${month}-${day}`}-${index}-file.log`;
};

const logger = createStream(generator, {
  size: "10M",
  interval: "1d",
  compress: "gzip",
});

const logConfiguration = {
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "logs/web3.log",
      format: format.combine(
        format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
        format.align(),
        format.printf(
          (info) => `${info.level}: ${[info.timestamp]}: ${info.message}`
        )
      ),
    }),
  ],
};

export const web3Logger = winston.createLogger(logConfiguration);

export default logger;
