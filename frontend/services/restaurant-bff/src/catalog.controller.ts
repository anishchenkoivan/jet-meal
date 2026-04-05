import { Controller, Get } from "@nestjs/common";

/** Публичный каталог ресторанов (без привязки к конкретному id в URL). */
@Controller("catalog")
export class CatalogController {
  @Get()
  list(): { restaurants: { id: string; name: string; city: string }[] } {
    return {
      restaurants: [
        { id: "demo-1", name: "Демо-ресторан «Север»", city: "Москва" },
        { id: "demo-2", name: "Демо-ресторан «Юг»", city: "Санкт-Петербург" },
      ],
    };
  }
}
