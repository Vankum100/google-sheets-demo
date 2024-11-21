import { Injectable } from '@nestjs/common';
import * as process from 'process';
import * as dotenv from 'dotenv';
dotenv.config();
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { google } = require('googleapis');
import { ClientResponseDto } from '../clients/dto/client-response.dto';

@Injectable()
export class GoogleSheetsService {
  private sheets;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_API_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    this.sheets = google.sheets({ version: 'v4', auth });
  }

  async saveClientsToSheet(sheetId: string, clients: ClientResponseDto[]) {
    const currentData = await this.sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Sheet1!A1:A',
    });

    const currentRows = currentData.data.values || [];
    const startingRowIndex =
      currentRows.length > 1 ? currentRows.length + 1 : 2;
    const headers =
      currentRows.length === 0
        ? [
            'ID',
            'First Name',
            'Last Name',
            'Gender',
            'Address',
            'City',
            'Phone',
            'Email',
            'Status',
          ]
        : null;

    const data = clients.map((client) => [
      client.id,
      client.firstName,
      client.lastName,
      client.gender,
      client.address,
      client.city,
      client.phone,
      client.email,
      client.status,
    ]);

    if (headers) {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: 'Sheet1!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [headers] },
      });
    }

    if (data.length > 0) {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `Sheet1!A${startingRowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: data },
      });
    }
  }
}
