import { PrismaClient } from '@prisma/client';


export const generateSlug = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};


export const createUniqueSlug = async (baseSlug: string, prisma: PrismaClient): Promise<string> => {
  let uniqueSlug = baseSlug;
  let counter = 1;

  // Loop until we find a slug that doesn't exist in the database
  while (true) {
    const existingShop = await prisma.shops.findUnique({
      where: {
        slug: uniqueSlug,
      },
    });

    if (!existingShop) {
      break;
    }

    // If the slug exists, append a counter and try again
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
};