import "dotenv/config";
import { S3Client } from "@aws-sdk/client-s3";
import fs from "fs";
import multer from "multer";
import path from "path";
import multerS3 from "multer-s3";
import { nanoid } from "nanoid";
import { generateMD5, getExtension } from "../app/helper/utils";

const ENV = process.env;

let s3Storage;
const bucket = ENV.FOG_DIRECTORY || "";

if (ENV.STORAGE === "s3") {
  const config = {
    region: ENV.FOG_REGION || "",
    credentials: {
      accessKeyId: ENV.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: ENV.AWS_SCERTE_KEY_ID || "",
    },
  };

  const s3 = new S3Client(config);

  s3Storage = multerS3({
    s3,
    bucket: bucket,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: async (req, file, cb) => {
      const extension = getExtension(file.originalname);
      const uuid = nanoid();
      const key = generateMD5(`${+new Date()}${uuid}`);
      const filePath = `${getBucketPath(file)}${key}${extension}`;

      cb(null, filePath);
    },
  });
}

const checkAvatarFileType = (req, file, cb) => {
  const fileTypes = /jpeg|png|jpg|gif/;
  const extName = fileTypes.test(path.extname(file.originalname).toLocaleLowerCase());
  const mimeType = fileTypes.test(file.mimetype);
  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb({ message: `Unsupport file type. File Type Support ${fileTypes}` });
  }
};

const getBucketPath = file => {
  if (file.fieldname === "avatar") {
    return "uploads/avatar/";
  }
  return "uploads/attachments/";
};

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.cwd() + "/public/uploads");
  },
  filename: function (req, file, cb) {
    const extension = getExtension(file.originalname);
    const uuid = nanoid();
    const key = generateMD5(`${+new Date()}${uuid}`);
    const filePath = `${key}${extension}`;

    cb(null, filePath);
  },
});

const storage = {
  disk: diskStorage,
  s3: s3Storage,
};

const upload = multer({
  storage: storage[process.env.STORAGE || "disk"],
  fileFilter: (req, file, cb) => {
    return checkAvatarFileType(req, file, cb);
    // cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export const s3Upload = url => {
  const file = fs.createReadStream(url);
  const buffer = fs.readFileSync(url);
  const fileContent = buffer.toString();
  const key = generateMD5(`${fileContent}`);
  const filePath = `uploads/attachments/${key}.png`;
  var params = {
    ACL: "public-read",
    Bucket: bucket || "",
    Body: file || "",
    Key: filePath || "",
    ContentType: "image/png",
  };
  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) resolve("");

      resolve(filePath);
    });
  });
};

async function getSignedUrl(key) {
  return new Promise((resolve, reject) => {
    const expires = 86400; // 1 days
    if (!key) {
      return resolve(null);
    }
    const params = { Bucket: bucket, Key: key, Expires: expires };
    s3.getSignedUrl("getObject", params, (err, endpoint) => {
      if (err) reject(err);
      if (!endpoint) {
        return resolve(null);
      }
      var uri = url.parse(endpoint);
      resolve(uri.path);
    });
  });
}

export const getImage = key => getSignedUrl(key);
export const getImagePath = key => `/${bucket}/${key}`;

export const deleteObject = key => {
  if(ENV.STORAGE === "s3"){
    const params = {
      Bucket: bucket,
      Key: key,
    };
    return new Promise((resolve, reject) => {
      s3.deleteObject(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  } 
};

export const deleteLocalObject = async url => {
  try {
    const path = process.cwd() + "/public" + url;
    await fs.unlinkSync(path);
    console.log("remove file successfully");
  } catch (err) {
    console.log(`remove file failure ${JSON.stringify(err)}`);
  }
};

export default upload;
