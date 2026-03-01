const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

/**
 * Upload a file buffer to Cloudflare R2
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} originalName - Original filename
 * @param {string} folder - Folder path (e.g. 'logos', 'signatures')
 * @returns {string} Public URL of the uploaded file
 */
async function uploadToR2(fileBuffer, originalName, folder = 'uploads') {
    const ext = originalName.split('.').pop();
    const uniqueName = `${folder}/${crypto.randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: uniqueName,
        Body: fileBuffer,
        ContentType: getContentType(ext),
    });

    await s3Client.send(command);

    return `${process.env.R2_PUBLIC_URL}/${uniqueName}`;
}

function getContentType(ext) {
    const types = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        svg: 'image/svg+xml',
        pdf: 'application/pdf',
    };
    return types[ext.toLowerCase()] || 'application/octet-stream';
}

module.exports = { uploadToR2 };
