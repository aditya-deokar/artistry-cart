import ImageKit from "imagekit";

let _imagekit: ImageKit | null = null;

export function getImageKit(): ImageKit {
  if (!_imagekit) {
    _imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_API_KEY!,
      privateKey: process.env.IMAGEKIT_PRIVATE_API_KEY!,
      urlEndpoint: "https://ik.imagekit.io/adityadeokar/",
    });
  }
  return _imagekit;
}

/** @deprecated Use `getImageKit()` instead — kept for backward compatibility */
export const imagekit = new Proxy({} as ImageKit, {
  get(_target, prop, receiver) {
    return Reflect.get(getImageKit(), prop, receiver);
  },
});