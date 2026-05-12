import { useEffect } from "react";

/**
 * Блокирует прокрутку документа (`html` + `body`).
 * Несколько одновременных потребителей (вложенные модалки) — счётчик, снимаем блок только когда все закрыты.
 */
let scrollLockDepth = 0;
let savedBodyOverflow = "";
let savedHtmlOverflow = "";

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) {
      return;
    }
    scrollLockDepth += 1;
    if (scrollLockDepth === 1) {
      savedBodyOverflow = document.body.style.overflow;
      savedHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }
    return () => {
      scrollLockDepth -= 1;
      if (scrollLockDepth <= 0) {
        scrollLockDepth = 0;
        document.body.style.overflow = savedBodyOverflow;
        document.documentElement.style.overflow = savedHtmlOverflow;
      }
    };
  }, [locked]);
}
