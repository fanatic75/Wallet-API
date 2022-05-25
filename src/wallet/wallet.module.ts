import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { DbModule } from 'src/db/db.module';

@Module({
  controllers: [WalletController],
  providers: [WalletService],
  imports:[DbModule]
})
export class WalletModule {}
