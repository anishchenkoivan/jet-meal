import cx from "classnames";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={cx(styles["main"])}>
      <h1 className={cx(styles["title"])}>Страница не найдена</h1>
      <p>Проверь URL или вернись в <a href="/catalog">/catalog</a>.</p>
    </main>
  );
}
