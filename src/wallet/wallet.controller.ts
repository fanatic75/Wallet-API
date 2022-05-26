import { Controller, Get, Post, Body,  Param,  Query } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateTransactionDto, CreateWalletDto, TransactionQuery } from './dto/create-wallet.dto';

@Controller('')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('setup')
  create(@Body() createWalletDto: CreateWalletDto) {
    return this.walletService.create(createWalletDto);
  }

  @Post('transact/:id')
  addTransaction(@Param('id') id:string, @Body() createTransactionDto:CreateTransactionDto) {
    return this.walletService.createTransaction(createTransactionDto, id);
  }

  @Get("transactions")
  findAll(@Query() transactionQuery:TransactionQuery) {
    return this.walletService.findAllTransactions(transactionQuery.walletId, transactionQuery.skip, transactionQuery.limit);
  }

  @Get('/wallet/:id')
  findOne(@Param('id') id: string) {
    return this.walletService.findWallet(id);
  }
}
