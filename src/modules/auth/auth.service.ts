import axios from 'axios';
import * as process from 'process';

export class AuthService {
  private apiBaseUrl = process.env.API_BASE_URL;

  async registerOrLogin(username: string): Promise<any> {
    try {
      const registrationResponse = await axios.post(
        `${this.apiBaseUrl}/auth/registration`,
        {
          username,
        },
      );
      console.log('User registered successfully:', registrationResponse.data);
      return registrationResponse.data;
    } catch (error) {
      if (
        error.response?.status === 400 &&
        error.response.data?.message ===
          'Пользователь с таким именем существует'
      ) {
        console.log('User already exists. Attempting login...');
        return this.login(username);
      } else {
        console.error('Registration failed:', error.message);
        throw error;
      }
    }
  }

  async login(username: string): Promise<any> {
    try {
      const loginResponse = await axios.post(`${this.apiBaseUrl}/auth/login`, {
        username,
      });
      console.log('User logged in successfully:', loginResponse.data);
      return loginResponse.data;
    } catch (error) {
      console.error('Login failed:', error.message);
      throw error;
    }
  }
}
