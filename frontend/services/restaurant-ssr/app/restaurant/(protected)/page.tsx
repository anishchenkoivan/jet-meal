import { cookies } from "next/headers";
import cx from "classnames";
import {
  RESTAURANT_ID_COOKIE,
  SESSION_ID_COOKIE,
} from "../../../lib/middlewares/authGuard";
import styles from "./page.module.css";

export default async function RestaurantPage() {
  const cookieStore = await cookies();
  const restaurantId = cookieStore.get(RESTAURANT_ID_COOKIE)?.value ?? "";
  const sessionId = cookieStore.get(SESSION_ID_COOKIE)?.value ?? "";

  return (
    <main>
      <h1 className={cx(styles["title"])}>Restaurant Panel</h1>
      <p>restaurant-id: {restaurantId}</p>
      <p>session-id: {sessionId}</p>
    </main>
  );
}
