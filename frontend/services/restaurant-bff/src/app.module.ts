import { Module } from "@nestjs/common";
import { AdminkaController } from "./adminka.controller.js";
import { CatalogController } from "./catalog.controller.js";

@Module({
  imports: [],
  controllers: [CatalogController, AdminkaController],
  providers: [],
})
export class AppModule {}
