import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DbModule } from './db/db.module';
import { WalletModule } from './wallet/wallet.module';
@Module({
  imports: [
    ConfigModule.forRoot(),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 300,
    }),
    DbModule,
    WalletModule
  ],
})
export class AppModule {}
