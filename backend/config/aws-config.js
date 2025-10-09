import AWS from "aws-sdk";

const s3 = new AWS.S3({
    region: "ap-south-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const S3_BUCKET = "subhajitdas2271bucket";

export { s3, S3_BUCKET };