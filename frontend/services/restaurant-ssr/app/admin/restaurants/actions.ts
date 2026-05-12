"use server";

import type { Restaurant } from "../../../src/types/restaurant";

export async function saveRestaurantAction(_data: Restaurant): Promise<void> {
  // TODO: wire to GraphQL mutation when backend ready
}

export async function deleteRestaurantAction(_id: string): Promise<void> {
  // TODO: wire to GraphQL mutation when backend ready
}
