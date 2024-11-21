import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './modules/auth/auth.service';
import { ClientsService } from './modules/clients/clients.service';
import { GoogleSheetsService } from './modules/google-sheets/google-sheets.service';
import * as dotenv from 'dotenv';
dotenv.config();
import * as process from 'process';

async function processBatch(
  clientsService: ClientsService,
  googleSheetsService: GoogleSheetsService,
  sharedData: { token: string; sheetId: string; offset: number; limit: number },
) {
  const { token, sheetId, offset, limit } = sharedData;

  const clients = await clientsService.getClients(token, limit, offset);
  if (!clients.length) {
    console.log(`No more data to process at offset ${offset}`);
    return false;
  }

  const statuses = await clientsService.getClientStatuses(
    token,
    clients.map((c) => c.id),
  );

  const clientsWithStatus = clients.map((client) => ({
    ...client,
    status: statuses.find((s) => s.id === client.id)?.status || 'Unknown',
  }));

  await googleSheetsService.saveClientsToSheet(sheetId, clientsWithStatus);

  console.log(`Processed batch: offset ${offset}, limit ${limit}`);
  return true;
}

async function main() {
  const app = await NestFactory.create(AppModule);

  const args = process.argv.slice(2);
  const limit = parseInt(args[0]) || 3500;
  const offset = parseInt(args[1]) || 0;
  const batchSize = 500;

  const authService = app.get(AuthService);
  const clientsService = app.get(ClientsService);
  const googleSheetsService = app.get(GoogleSheetsService);

  const user = await authService.registerOrLogin('test user');
  console.log(`User logged in: ${user.token}`);

  const sharedData = {
    token: user.token,
    sheetId: process.env.GOOGLE_SHEETS_ID,
  };

  let currentOffset = offset;
  while (currentOffset < offset + limit) {
    const batchData = {
      ...sharedData,
      offset: currentOffset,
      limit: batchSize,
    };
    const hasMoreData = await processBatch(
      clientsService,
      googleSheetsService,
      batchData,
    );

    if (!hasMoreData) break;
    currentOffset += batchSize;
  }

  console.log('All batches processed successfully!');
  await app.close();
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
