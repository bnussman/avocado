import { FileUpload } from "graphql-upload";
import { S3 } from 'aws-sdk';
import { File } from '../entities/File';
import { Post } from "../entities/Post";
import { User } from "../entities/User";

const client = new S3({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_ACCESS_KEY_SECRET,
  endpoint: "https://us-southeast-1.linodeobjects.com"
});

export async function upload({ filename, createReadStream }: FileUpload, userId: string): Promise<string> {
  const extention = getFileExtention(filename);

  const Key = `profiles/${userId}-${Date.now()}${extention}`;

  const params = {
    Key,
    Body: createReadStream(),
    Bucket: "avocado",
    ACL: "public-read"
  };

  const data = await client.upload(params).promise();

  if (!data.Location) {
    throw new Error("Unable to upload profile picture to S3");
  }

  return data.Location;
}

export async function uploadMany(uploads: Promise<FileUpload>[], post: Post, user: User) {
  const files: File[] = [];

  for (let i = 0; i < uploads.length; i++) {
    const { filename, createReadStream } = await uploads[i];

    const extention = getFileExtention(filename);

    const Key = `posts/${post.id}/${i}${extention}`;

    const params = {
      Key,
      Body: createReadStream(),
      Bucket: "avocado",
      ACL: "public-read"
    };

    const data = await client.upload(params).promise();

    if (!data.Location) {
      throw new Error("Unable to upload profile picture to S3");
    }

    files.push(new File({ url: data.Location, post, user }));
  }

  return files;
}

function getFileExtention(fileName: string) {
  return fileName.substring(fileName.lastIndexOf("."), fileName.length);
}
