import { Module } from '@nestjs/common';
import { AuthService } from './modules/auth/auth.service';
import { ClientsService } from './modules/clients/clients.service';
import { GoogleSheetsService } from './modules/google-sheets/google-sheets.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [AuthService, ClientsService, GoogleSheetsService],
})
export class AppModule {}
