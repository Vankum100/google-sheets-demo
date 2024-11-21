import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as process from 'process';
import { ClientResponseDto } from './dto/client-response.dto';
import { StatusResponseDto } from './dto/status-response.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly httpService: HttpService) {}

  async getClients(
    token: string,
    limit = 5,
    offset = 0,
  ): Promise<ClientResponseDto[]> {
    const response = await firstValueFrom(
      this.httpService.get(`${process.env.API_BASE_URL}/clients`, {
        headers: { Authorization: token },
        params: { limit, offset },
      }),
    );
    return response.data.map(
      (client: any) =>
        ({
          id: client.id,
          firstName: client.firstName,
          lastName: client.lastName,
          gender: client.gender,
          address: client.address,
          city: client.city,
          phone: client.phone,
          email: client.email,
          status: null,
        }) as ClientResponseDto,
    );
  }

  async getClientStatuses(
    token: string,
    userIds: number[],
  ): Promise<StatusResponseDto[]> {
    const response = await firstValueFrom(
      this.httpService.post(
        `${process.env.API_BASE_URL}/clients`,
        { userIds },
        { headers: { Authorization: token } },
      ),
    );
    return response.data.map(
      (status: any) =>
        ({
          id: status.id,
          status: status.status,
        }) as StatusResponseDto,
    );
  }
}
