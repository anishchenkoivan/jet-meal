import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UnauthorizedException,
} from "@nestjs/common";

@Controller("adminka")
export class AdminkaController {
  /** Заглушка: проверка, что id не пустой (реальная авторизация — позже). */
  @Post("login")
  login(@Body() body: { restaurantId?: string }): { ok: true; restaurantId: string } {
    const id = body.restaurantId?.trim();
    if (!id) {
      throw new BadRequestException("restaurantId required");
    }
    return { ok: true, restaurantId: id };
  }

  /**
   * Данные «текущего» ресторана: id из заголовка (проксирует gateway) или с фронта после логина.
   * В URL id не передаётся.
   */
  @Get("restaurant")
  restaurant(
    @Headers("x-restaurant-id") headerId: string | undefined,
  ): { id: string; name: string; address: string } {
    const id = headerId?.trim();
    if (!id) {
      throw new UnauthorizedException("x-restaurant-id required");
    }
    return {
      id,
      name: `Ресторан (${id.slice(0, 8)}…)`,
      address: "Адрес будет из БД",
    };
  }
}
