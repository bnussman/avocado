import { FileUpload } from "graphql-upload";
import { S3 } from 'aws-sdk';

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

function getFileExtention(fileName: string) {
  return fileName.substring(fileName.lastIndexOf("."), fileName.length);
}
