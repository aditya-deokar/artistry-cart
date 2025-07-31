import ImageKit from "imagekit";



export const imagekit = new ImageKit({
    publicKey : process.env.IMAGEKIT_PUBLIC_API_KEY!,
    privateKey : process.env.IMAGEKIT_PRIVATE_API_KEY!,
    urlEndpoint : "https://ik.imagekit.io/adityadeokar/"
});