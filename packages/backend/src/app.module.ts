import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaService } from "./prisma/prisma.service";
import { EventsGateway } from "./events.gateway";

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PrismaService, EventsGateway],
})
export class AppModule {}
