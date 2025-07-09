import prisma from "@/lib/prisma";

/**
 * Handles the creation of a new user and their associated shop and subscription
 * in a single atomic transaction. If the user already exists, it does nothing.
 * This is an "upsert" pattern specifically for the initial user sign-up.
 *
 * @param {import('next-auth').User} user - The user object from the Auth.js callback.
 * @returns {Promise<import('@prisma/client').User | null>} The created or existing user, or null on failure.
 */
export async function upsertUserAndCreateShop(user) {
  if (!user || !user.email) {
    console.error("Invalid user object provided for upsert.");
    return null;
  }

  try {
    // Check if the user already exists in our database
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    // If the user already exists, the process is successful. Return the user.
    if (existingUser) {
      // User exists, now check if they have a shop.
      const existingShop = await prisma.shop.findUnique({
        where: { ownerId: existingUser.id },
      });
      if (!existingShop) {
        // If they don't have a shop, create one for them.
        await prisma.shop.create({
          data: {
            name: `${existingUser.name}'s Shop`,
            ownerId: existingUser.id,
            // Also create a default subscription here if needed
          },
        });
      }
      return existingUser; // Return the user
    }

    // If the user is new, create the User, Shop, and Subscription
    // in a single atomic transaction to ensure data integrity.
    const newUser = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: user.name,
          email: user.email,
          image: user.image,
          role: "SHOP_OWNER", // New users are always the Shop Owner
        },
      });

      const createdShop = await tx.shop.create({
        data: {
          name: `${user.name}'s Shop`, // A sensible default shop name
          ownerId: createdUser.id,
        },
      });

      // Set up the initial 14-day free trial subscription
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14);

      await tx.subscription.create({
        data: {
          shopId: createdShop.id,
          plan: "FREE_TRIAL",
          status: "TRIALING",
          endDate: trialEndDate,
        },
      });

      return createdUser;
    });

    return newUser;
  } catch (error) {
    console.error("Failed to upsert user and create shop:", error);
    // Return null to indicate failure, which can be handled in the auth callback.
    return null;
  }
}
