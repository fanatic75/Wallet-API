import { Type } from 'class-transformer';
import {  IsNotEmpty, IsNumber, IsNumberString, Min} from 'class-validator';

export class CreateWalletDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    balance:number;
    @IsNotEmpty()
    name:string;
}


export class CreateTransactionDto{
    @IsNotEmpty()
    @IsNumber()
    amount:number;
    @IsNotEmpty()
    description:string;
}

export class TransactionQuery{
    
    @Type(()=>Number)
    @Min(0)
    skip?:number = 0;

    @IsNotEmpty()
    walletId:string;


    @Type(()=>Number)
    @Min(1)
    limit?: number = 10;
    constructor(skip = 0, limit = 10) {
        this.skip = skip;
        this.limit = limit;
      }
}