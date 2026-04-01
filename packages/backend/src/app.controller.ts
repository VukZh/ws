import { Controller, Get, Param } from "@nestjs/common";
import { AppService } from "./app.service";
import { PrismaService } from "./prisma/prisma.service";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("events/:room")
  async getEventsRoom(@Param("room") room: string) {
    try {
      return await this.prisma.event.findMany({
        where: {
          room: room,
        },
        orderBy: {
          timestamp: "desc",
        },
      });
    } catch (error) {
      return { error: error.message };
    }
  }
}
